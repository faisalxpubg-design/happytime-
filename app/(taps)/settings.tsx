import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Store,
  Printer,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Bluetooth,
  Users,
  LogOut,
  Key,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [restaurantName, setRestaurantName] = useState("هابي تايم");
  const [printerEnabled, setPrinterEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon color="#FF6B35" size={20} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const handleExportData = () => {
    Alert.alert(
      "تصدير البيانات",
      "سيتم تصدير جميع بيانات المطعم إلى ملف",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "تصدير", onPress: () => console.log("Exporting data...") },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      "استيراد البيانات",
      "سيتم استبدال البيانات الحالية بالبيانات المستوردة",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "استيراد", style: "destructive", onPress: () => console.log("Importing data...") },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "مسح البيانات",
      "هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "مسح", style: "destructive", onPress: () => console.log("Clearing data...") },
      ]
    );
  };

  const handlePrinterSetup = () => {
    Alert.alert(
      "إعداد الطابعة",
      "سيتم البحث عن طابعات البلوتوث المتاحة",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "بحث", onPress: () => console.log("Searching for printers...") },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "خروج", 
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          }
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      "تغيير كلمة المرور",
      "هذه الميزة قيد التطوير",
      [{ text: "حسناً" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <SettingSection title="معلومات المطعم">
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>اسم المطعم</Text>
            <TextInput
              style={styles.textInput}
              value={restaurantName}
              onChangeText={setRestaurantName}
              textAlign="right"
            />
          </View>
          
          <SettingItem
            icon={Store}
            title="إعدادات المطعم المتقدمة"
            subtitle="العنوان، رقم الهاتف، الضرائب، والمزيد"
            onPress={() => router.push('/restaurant-settings')}
          />
        </SettingSection>

        {/* Printer Settings */}
        <SettingSection title="إعدادات الطباعة">
          <SettingItem
            icon={Printer}
            title="تفعيل الطباعة"
            subtitle="طباعة الفواتير تلقائياً"
            rightElement={
              <Switch
                value={printerEnabled}
                onValueChange={setPrinterEnabled}
                trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                thumbColor="white"
              />
            }
          />
          
          <SettingItem
            icon={Bluetooth}
            title="إعدادات الطباعة المتقدمة"
            subtitle="إعداد الطابعة وتخصيص الفواتير"
            onPress={() => router.push('/printer-settings')}
          />
          
          <SettingItem
            icon={Printer}
            title="اختبار الطباعة"
            subtitle="طباعة فاتورة تجريبية"
            onPress={handlePrinterSetup}
          />
        </SettingSection>

        {/* App Settings */}
        <SettingSection title="إعدادات التطبيق">
          <SettingItem
            icon={Bell}
            title="الأصوات"
            subtitle="تشغيل أصوات التنبيهات"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                thumbColor="white"
              />
            }
          />
          
          <SettingItem
            icon={Palette}
            title="المظهر"
            subtitle="تخصيص ألوان التطبيق"
            onPress={() => console.log("Theme settings")}
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="إدارة البيانات">
          <SettingItem
            icon={Database}
            title="النسخ الاحتياطي التلقائي"
            subtitle="حفظ البيانات تلقائياً"
            rightElement={
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                thumbColor="white"
              />
            }
          />
          
          <SettingItem
            icon={Download}
            title="تصدير البيانات"
            subtitle="حفظ نسخة من البيانات"
            onPress={handleExportData}
          />
          
          <SettingItem
            icon={Upload}
            title="استيراد البيانات"
            subtitle="استعادة البيانات من ملف"
            onPress={handleImportData}
          />
        </SettingSection>

        {/* User Management - Only for Admins */}
        {currentUser?.role === "admin" && (
          <SettingSection title="إدارة المستخدمين">
            <SettingItem
              icon={Users}
              title="إدارة المستخدمين"
              subtitle="إضافة وتعديل وحذف المستخدمين"
              onPress={() => router.push('/user-management')}
            />
          </SettingSection>
        )}

        {/* Security */}
        <SettingSection title="الأمان">
          <SettingItem
            icon={Key}
            title="تغيير كلمة المرور"
            subtitle="تغيير كلمة مرور المستخدم الحالي"
            onPress={handleChangePassword}
          />
          
          {currentUser?.role === "admin" && (
            <SettingItem
              icon={Trash2}
              title="مسح جميع البيانات"
              subtitle="حذف جميع المنتجات والفواتير"
              onPress={handleClearData}
            />
          )}
        </SettingSection>

        {/* Account */}
        <SettingSection title="الحساب">
          <View style={styles.userInfoContainer}>
            <Text style={styles.currentUserLabel}>المستخدم الحالي:</Text>
            <Text style={styles.currentUserName}>{currentUser?.fullName}</Text>
            <Text style={styles.currentUserRole}>
              {currentUser?.role === "admin" ? "مدير" : "كاشير"}
            </Text>
          </View>
          
          <SettingItem
            icon={LogOut}
            title="تسجيل الخروج"
            subtitle="الخروج من التطبيق"
            onPress={handleLogout}
          />
        </SettingSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>نظام هابي تايم للمبيعات</Text>
          <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 جميع الحقوق محفوظة</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FF6B35",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "right",
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF3F0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    textAlign: "right",
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "right",
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
  },
  appInfo: {
    alignItems: "center",
    padding: 32,
    marginTop: 24,
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: "#999",
  },
  userInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  currentUserLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  currentUserRole: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
});
