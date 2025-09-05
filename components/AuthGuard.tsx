import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { router, useSegments } from "expo-router";

function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center", 
      backgroundColor: "#FF6B35" 
    }}>
      <View style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
      }}>
        <Text style={{ fontSize: 48 }}>🍔</Text>
      </View>
      <Text style={{
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
      }}>هابي تايم</Text>
      <Text style={{
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 20,
      }}>نظام نقطة البيع</Text>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Set navigation as ready after a short delay to ensure router is initialized
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't proceed if navigation isn't ready or auth is loading
    if (!isNavigationReady || isLoading) return;
    
    // Don't proceed if segments are empty (initial load)
    if (!segments || segments.length < 1) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const inLoginScreen = segments[0] === "login";
    const inProtectedRoutes = [
      "checkout", 
      "receipt", 
      "printer-settings", 
      "restaurant-settings", 
      "user-management"
    ].includes(segments[0]);

    // Add a small delay to ensure navigation is fully ready
    const timeoutId = setTimeout(() => {
      try {
        if (!isAuthenticated && (inAuthGroup || inProtectedRoutes)) {
          // Redirect to login if not authenticated and trying to access protected routes
          console.log("Redirecting to login - not authenticated");
          router.replace("/login");
        } else if (isAuthenticated && inLoginScreen) {
          // Redirect to main app if authenticated and on login screen
          console.log("Redirecting to tabs - already authenticated");
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Navigation error in AuthGuard:", error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, segments, isNavigationReady, isLoading]);

  // Show loading while navigation is not ready or auth is loading
  if (!isNavigationReady || isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

class AuthGuardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("AuthGuard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <LoadingScreen />;
    }

    return this.props.children;
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardErrorBoundary>
      <AuthGuardInner>{children}</AuthGuardInner>
    </AuthGuardErrorBoundary>
  );
}
