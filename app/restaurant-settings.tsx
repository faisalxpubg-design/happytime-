import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Percent,
  CreditCard,
  Users,
  Settings,
} from 'lucide-react-native';

export default function RestaurantSettingsScreen() {
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'هابي تايم',
    description: 'مطعم السندوتشات الشهية',
    address: 'شارع الملك فهد، الرياض',
    phone: '+966501234567',
    email: 'info@happytime.sa',
    website: 'www.happytime.sa',
    workingHours: 'من 8 صباحاً إلى 12 منتصف الليل',
    taxRate: '15',
    serviceCharge: '0',
    currency: 'د.ل',
    allowDiscounts: true,
    requireCustomerInfo: false,
    enableLoyaltyProgram: false,
  });

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const InputField = ({
    icon: Icon,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
  }: {
    icon: any;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: any;
    multiline?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        <Icon color="#FF6B35" size={20} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlign="right"
      />
    </View>
  );

  const SwitchField = ({
    icon: Icon,
    label,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: any;
    label: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchInfo}>
        <View style={styles.switchIcon}>
          <Icon color="#FF6B35" size={20} />
        </View>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>{label}</Text>
          {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
        thumbColor="white"
      />
    </View>
  );

  const handleSave = () => {
    Alert.alert(
      'حفظ الإعدادات',
      'تم حفظ إعدادات المطعم بنجاح',
      [{ text: 'موافق' }]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين',
      'هل تريد إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إعادة تعيين', 
          style: 'destructive',
          onPress: () => {
            setRestaurantInfo({
              name: 'هابي تايم',
              description: 'مطعم السندوتشات الشهية',
              address: 'شارع الملك فهد، الرياض',
              phone: '+966501234567',
              email: 'info@happytime.sa',
              website: 'www.happytime.sa',
              workingHours: 'من 8 صباحاً إلى 12 منتصف الليل',
              taxRate: '15',
              serviceCharge: '0',
              currency: 'د.ل',
              allowDiscounts: true,
              requireCustomerInfo: false,
              enableLoyaltyProgram: false,
            });
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إعدادات المطعم</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <SettingSection title="المعلومات الأساسية">
          <InputField
            icon={Store}
            label="اسم المطعم"
            value={restaurantInfo.name}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, name: text }))}
            placeholder="أدخل اسم المطعم"
          />

          <InputField
            icon={Settings}
            label="وصف المطعم"
            value={restaurantInfo.description}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, description: text }))}
            placeholder="وصف مختصر للمطعم"
            multiline
          />

          <InputField
            icon={MapPin}
            label="العنوان"
            value={restaurantInfo.address}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, address: text }))}
            placeholder="عنوان المطعم"
            multiline
          />

          <InputField
            icon={Phone}
            label="رقم الهاتف"
            value={restaurantInfo.phone}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, phone: text }))}
            placeholder="+966501234567"
            keyboardType="phone-pad"
          />

          <InputField
            icon={Mail}
            label="البريد الإلكتروني"
            value={restaurantInfo.email}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, email: text }))}
            placeholder="info@restaurant.com"
            keyboardType="email-address"
          />

          <InputField
            icon={Globe}
            label="الموقع الإلكتروني"
            value={restaurantInfo.website}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, website: text }))}
            placeholder="www.restaurant.com"
          />

          <InputField
            icon={Clock}
            label="ساعات العمل"
            value={restaurantInfo.workingHours}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, workingHours: text }))}
            placeholder="من 8 صباحاً إلى 12 منتصف الليل"
          />
        </SettingSection>

        {/* Financial Settings */}
        <SettingSection title="الإعدادات المالية">
          <InputField
            icon={Percent}
            label="معدل الضريبة (%)"
            value={restaurantInfo.taxRate}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, taxRate: text }))}
            placeholder="15"
            keyboardType="numeric"
          />

          <InputField
            icon={CreditCard}
            label="رسوم الخدمة (%)"
            value={restaurantInfo.serviceCharge}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, serviceCharge: text }))}
            placeholder="0"
            keyboardType="numeric"
          />

          <InputField
            icon={CreditCard}
            label="العملة"
            value={restaurantInfo.currency}
            onChangeText={(text) => setRestaurantInfo(prev => ({ ...prev, currency: text }))}
            placeholder="د.ل"
          />
        </SettingSection>

        {/* Business Settings */}
        <SettingSection title="إعدادات العمل">
          <SwitchField
            icon={Percent}
            label="السماح بالخصومات"
            subtitle="تمكين إضافة خصومات على الطلبات"
            value={restaurantInfo.allowDiscounts}
            onValueChange={(value) => setRestaurantInfo(prev => ({ ...prev, allowDiscounts: value }))}
          />

          <SwitchField
            icon={Users}
            label="طلب معلومات العميل"
            subtitle="إجبار إدخال اسم ورقم العميل"
            value={restaurantInfo.requireCustomerInfo}
            onValueChange={(value) => setRestaurantInfo(prev => ({ ...prev, requireCustomerInfo: value }))}
          />

          <SwitchField
            icon={Store}
            label="برنامج الولاء"
            subtitle="تفعيل نظام نقاط الولاء للعملاء"
            value={restaurantInfo.enableLoyaltyProgram}
            onValueChange={(value) => setRestaurantInfo(prev => ({ ...prev, enableLoyaltyProgram: value }))}
          />
        </SettingSection>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>حفظ الإعدادات</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>إعادة تعيين</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF3F0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    textAlign: "right",
  },
  actionButtons: {
    marginTop: 32,
    paddingHorizontal: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  resetButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});
