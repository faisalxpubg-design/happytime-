import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Shield,
  User,
  Eye,
  EyeOff,
  X,
  Check,
  UserX,
  UserCheck,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/providers/AuthProvider";

interface UserFormData {
  username: string;
  password: string;
  fullName: string;
  role: "admin" | "cashier";
}

export default function UserManagementScreen() {
  const { users, currentUser, addUser, updateUser, deleteUser, toggleUserStatus } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    fullName: "",
    role: "cashier",
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: "cashier",
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleAddUser = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setFormData({
        username: user.username,
        password: user.password,
        fullName: user.fullName,
        role: user.role,
      });
      setEditingUser(userId);
      setShowModal(true);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.username.trim() || !formData.password.trim() || !formData.fullName.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      let success = false;
      if (editingUser) {
        success = await updateUser(editingUser, formData);
        if (!success) {
          Alert.alert("خطأ", "اسم المستخدم موجود بالفعل");
          return;
        }
      } else {
        success = await addUser({ ...formData, isActive: true });
        if (!success) {
          Alert.alert("خطأ", "اسم المستخدم موجود بالفعل");
          return;
        }
      }

      if (success) {
        setShowModal(false);
        resetForm();
        Alert.alert("نجح", editingUser ? "تم تحديث المستخدم بنجاح" : "تم إضافة المستخدم بنجاح");
      }
    } catch {
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ المستخدم");
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف المستخدم "${user.fullName}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const success = await deleteUser(userId);
            if (!success) {
              Alert.alert("خطأ", "لا يمكن حذف آخر مدير أو المستخدم الحالي");
            } else {
              Alert.alert("نجح", "تم حذف المستخدم بنجاح");
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const action = user.isActive ? "إلغاء تفعيل" : "تفعيل";
    Alert.alert(
      `تأكيد ${action}`,
      `هل أنت متأكد من ${action} المستخدم "${user.fullName}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: action,
          onPress: async () => {
            const success = await toggleUserStatus(userId);
            if (!success) {
              Alert.alert("خطأ", "لا يمكن إلغاء تفعيل آخر مدير أو المستخدم الحالي");
            } else {
              Alert.alert("نجح", `تم ${action} المستخدم بنجاح`);
            }
          },
        },
      ]
    );
  };

  const getRoleText = (role: "admin" | "cashier") => {
    return role === "admin" ? "مدير" : "كاشير";
  };

  const getRoleColor = (role: "admin" | "cashier") => {
    return role === "admin" ? "#FF6B35" : "#4CAF50";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Users color="white" size={24} />
          <Text style={styles.headerTitle}>إدارة المستخدمين</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                <View style={styles.userBadges}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                    <Shield color="white" size={12} />
                    <Text style={styles.roleText}>{getRoleText(user.role)}</Text>
                  </View>
                  {!user.isActive && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>معطل</Text>
                    </View>
                  )}
                  {currentUser?.id === user.id && (
                    <View style={styles.currentUserBadge}>
                      <Text style={styles.currentUserText}>أنت</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.userDate}>
                تاريخ الإنشاء: {new Date(user.createdAt).toLocaleDateString("ar-SA")}
              </Text>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditUser(user.id)}
              >
                <Edit3 color="#4CAF50" size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.toggleButton]}
                onPress={() => handleToggleStatus(user.id)}
              >
                {user.isActive ? (
                  <UserX color="#FF9800" size={16} />
                ) : (
                  <UserCheck color="#4CAF50" size={16} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(user.id)}
              >
                <Trash2 color="#F44336" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit User Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الاسم الكامل *</Text>
                <View style={styles.inputWrapper}>
                  <User color="#666" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="أدخل الاسم الكامل"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>اسم المستخدم *</Text>
                <View style={styles.inputWrapper}>
                  <User color="#666" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="أدخل اسم المستخدم"
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                    autoCapitalize="none"
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>كلمة المرور *</Text>
                <View style={styles.inputWrapper}>
                  <Eye color="#666" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={!showPassword}
                    textAlign="right"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff color="#666" size={20} />
                    ) : (
                      <Eye color="#666" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الصلاحية *</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === "admin" && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: "admin" })}
                  >
                    <Shield
                      color={formData.role === "admin" ? "white" : "#FF6B35"}
                      size={16}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.role === "admin" && styles.roleOptionTextActive,
                      ]}
                    >
                      مدير
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === "cashier" && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: "cashier" })}
                  >
                    <User
                      color={formData.role === "cashier" ? "white" : "#4CAF50"}
                      size={16}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.role === "cashier" && styles.roleOptionTextActive,
                      ]}
                    >
                      كاشير
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveUser}>
                <LinearGradient
                  colors={["#FF6B35", "#FF8A65"]}
                  style={styles.saveGradient}
                >
                  <Check color="white" size={16} />
                  <Text style={styles.saveButtonText}>
                    {editingUser ? "تحديث" : "إضافة"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  userBadges: {
    flexDirection: "row",
    gap: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  inactiveBadge: {
    backgroundColor: "#F44336",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  currentUserBadge: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentUserText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  userDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  editButton: {
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  toggleButton: {
    borderColor: "#FF9800",
    borderWidth: 1,
  },
  deleteButton: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "right",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginHorizontal: 12,
  },
  eyeButton: {
    padding: 4,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 12,
  },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    gap: 8,
  },
  roleOptionActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  roleOptionTextActive: {
    color: "white",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
