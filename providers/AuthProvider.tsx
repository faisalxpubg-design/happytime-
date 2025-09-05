import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "cashier";
  fullName: string;
  createdAt: string;
  isActive: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  changePassword: (userId: string, newPassword: string) => Promise<boolean>;
  toggleUserStatus: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: "happy_time_users",
  CURRENT_USER: "happy_time_current_user",
};

const defaultAdmin: User = {
  id: "1",
  username: "admin",
  password: "admin",
  role: "admin",
  fullName: "المدير العام",
  createdAt: new Date().toISOString(),
  isActive: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      console.log("Loading auth data...");
      setIsLoading(true);
      
      const [usersData, currentUserData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      ]);

      // Load users or create default admin
      const loadedUsers = usersData ? JSON.parse(usersData) : [defaultAdmin];
      setUsers(loadedUsers);
      console.log("Loaded users:", loadedUsers.length);

      // Save default admin if no users exist
      if (!usersData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultAdmin]));
        console.log("Created default admin");
      }

      // Check if user is already logged in
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        const user = loadedUsers.find((u: User) => u.id === userData.id && u.isActive);
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          console.log("User already logged in:", user.username);
        } else {
          // Clear invalid session
          await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          console.log("Cleared invalid session");
        }
      } else {
        console.log("No current user session found");
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = async (newUsers: User[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
      setUsers(newUsers);
    } catch (error) {
      console.error("Error saving users:", error);
      throw error;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = users.find(
        (u) => u.username === username && u.password === password && u.isActive
      );

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: user.id }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const addUser = async (userData: Omit<User, "id" | "createdAt">): Promise<boolean> => {
    try {
      // Check if username already exists
      if (users.some((u) => u.username === userData.username)) {
        return false;
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const newUsers = [...users, newUser];
      await saveUsers(newUsers);
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      return false;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      // Don't allow updating username to existing one
      if (updates.username && users.some((u) => u.id !== id && u.username === updates.username)) {
        return false;
      }

      const newUsers = users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      );
      await saveUsers(newUsers);

      // Update current user if it's the same user
      if (currentUser && currentUser.id === id) {
        setCurrentUser({ ...currentUser, ...updates });
      }

      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // Don't allow deleting the last admin
      const admins = users.filter((u) => u.role === "admin" && u.id !== id);
      if (admins.length === 0) {
        return false;
      }

      // Don't allow deleting current user
      if (currentUser && currentUser.id === id) {
        return false;
      }

      const newUsers = users.filter((user) => user.id !== id);
      await saveUsers(newUsers);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      return await updateUser(userId, { password: newPassword });
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  };

  const toggleUserStatus = async (id: string): Promise<boolean> => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user) return false;

      // Don't allow deactivating the last admin
      if (user.role === "admin" && user.isActive) {
        const activeAdmins = users.filter((u) => u.role === "admin" && u.isActive && u.id !== id);
        if (activeAdmins.length === 0) {
          return false;
        }
      }

      // Don't allow deactivating current user
      if (currentUser && currentUser.id === id && user.isActive) {
        return false;
      }

      return await updateUser(id, { isActive: !user.isActive });
    } catch (error) {
      console.error("Error toggling user status:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    currentUser,
    users,
    isAuthenticated,
    isLoading,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
    toggleUserStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider");
    // Return a default context instead of throwing
    return {
      currentUser: null,
      users: [],
      isAuthenticated: false,
      isLoading: true,
      login: async () => false,
      logout: () => {},
      addUser: async () => false,
      updateUser: async () => false,
      deleteUser: async () => false,
      changePassword: async () => false,
      toggleUserStatus: async () => false,
    };
  }
  return context;
}
