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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Printer,
  Bluetooth,
  Settings,
  Wifi,
  TestTube,
  Copy,
  Palette,
  Info,
  CheckCircle,

  Search,
  ArrowRight,
  Signal,
  Zap,
  RefreshCw,
  AlertCircle,
  Shield,
} from 'lucide-react-native';
import { usePrinter } from '@/providers/PrinterProvider';

export default function PrinterSettingsScreen() {
  const {
    isConnected,
    availablePrinters,
    settings,
    isScanning,
    scanForPrinters,
    connectToPrinter,
    disconnectPrinter,
    updateSettings,
    testPrint,
  } = usePrinter();

  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

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
    showArrow = false,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon color="#FF6B35" size={20} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View>{rightElement}</View>}
      {showArrow && <ArrowRight color="#999" size={16} />}
    </TouchableOpacity>
  );

  const handleTestPrint = async () => {
    const success = await testPrint();
    if (success) {
      Alert.alert('نجح الاختبار', 'تم إرسال صفحة الاختبار للطباعة');
    }
  };

  const PrinterModal = () => (
    <Modal
      visible={showPrinterModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPrinterModal(false)}>
            <Text style={styles.modalCloseButton}>إغلاق</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>اختيار الطابعة</Text>
          <TouchableOpacity onPress={scanForPrinters} disabled={isScanning}>
            {isScanning ? (
              <ActivityIndicator color="#FF6B35" />
            ) : (
              <Search color="#FF6B35" size={24} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {isScanning && (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.scanningText}>البحث عن الطابعات...</Text>
            </View>
          )}

          {availablePrinters.map((printer) => (
            <TouchableOpacity
              key={printer.id}
              style={[
                styles.printerItem,
                printer.connected && styles.connectedPrinter,
              ]}
              onPress={() => {
                if (printer.connected) {
                  Alert.alert(
                    'قطع الاتصال',
                    `هل تريد قطع الاتصال من ${printer.name}؟`,
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      { text: 'قطع الاتصال', onPress: disconnectPrinter, style: 'destructive' },
                    ]
                  );
                } else {
                  connectToPrinter(printer);
                }
              }}
            >
              <View style={styles.printerIcon}>
                <Printer color={printer.connected ? "#4CAF50" : "#666"} size={24} />
              </View>
              <View style={styles.printerInfo}>
                <Text style={styles.printerName}>{printer.name}</Text>
                <Text style={styles.printerAddress}>{printer.address}</Text>
                <View style={styles.printerMeta}>
                  <View style={styles.printerTypeTag}>
                    <Bluetooth color="#666" size={12} />
                    <Text style={styles.printerTypeText}>بلوتوث</Text>
                  </View>
                  {printer.connected && (
                    <View style={[styles.printerTypeTag, { backgroundColor: '#E8F5E8' }]}>
                      <Signal color="#4CAF50" size={12} />
                      <Text style={[styles.printerTypeText, { color: '#4CAF50' }]}>متصل</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.printerStatus}>
                {printer.connected ? (
                  <CheckCircle color="#4CAF50" size={20} />
                ) : (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      connectToPrinter(printer);
                    }}
                  >
                    <Text style={styles.connectButtonText}>اتصال</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {!isScanning && availablePrinters.length === 0 && (
            <View style={styles.emptyContainer}>
              <Bluetooth color="#999" size={48} />
              <Text style={styles.emptyText}>لم يتم العثور على طابعات</Text>
              <Text style={styles.emptySubtext}>
                تأكد من تفعيل البلوتوث وأن الطابعة في وضع الاقتران
              </Text>
              <TouchableOpacity style={styles.scanButton} onPress={scanForPrinters}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Search color="white" size={16} style={{ marginRight: 8 }} />
                  <Text style={styles.scanButtonText}>البحث مرة أخرى</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const AdvancedSettingsModal = () => (
    <Modal
      visible={showAdvancedSettings}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAdvancedSettings(false)}>
            <Text style={styles.modalCloseButton}>إغلاق</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>الإعدادات المتقدمة</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <SettingSection title="تخصيص الطباعة">
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>عرض الورق (مم)</Text>
              <TextInput
                style={styles.numberInput}
                value={settings.paperWidth.toString()}
                onChangeText={(text) => {
                  const width = parseInt(text) || 58;
                  updateSettings({ paperWidth: width });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>حجم الخط</Text>
              <TextInput
                style={styles.numberInput}
                value={settings.fontSize.toString()}
                onChangeText={(text) => {
                  const size = parseInt(text) || 12;
                  updateSettings({ fontSize: size });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>عدد النسخ</Text>
              <TextInput
                style={styles.numberInput}
                value={settings.copies.toString()}
                onChangeText={(text) => {
                  const copies = parseInt(text) || 1;
                  updateSettings({ copies: Math.max(1, Math.min(5, copies)) });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>
          </SettingSection>

          <SettingSection title="محتوى الفاتورة">
            <SettingItem
              icon={Palette}
              title="طباعة الشعار"
              subtitle="إظهار اسم المطعم في أعلى الفاتورة"
              rightElement={
                <Switch
                  value={settings.printLogo}
                  onValueChange={(value) => updateSettings({ printLogo: value })}
                  trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                  thumbColor="white"
                />
              }
            />

            <SettingItem
              icon={Info}
              title="معلومات العميل"
              subtitle="طباعة اسم ورقم هاتف العميل"
              rightElement={
                <Switch
                  value={settings.printCustomerInfo}
                  onValueChange={(value) => updateSettings({ printCustomerInfo: value })}
                  trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                  thumbColor="white"
                />
              }
            />

            <SettingItem
              icon={Copy}
              title="تذييل الفاتورة"
              subtitle="رسالة الشكر في نهاية الفاتورة"
              rightElement={
                <Switch
                  value={settings.printFooter}
                  onValueChange={(value) => updateSettings({ printFooter: value })}
                  trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                  thumbColor="white"
                />
              }
            />
          </SettingSection>

          <SettingSection title="الاتصال والأمان">
            <SettingItem
              icon={Bluetooth}
              title="الاتصال التلقائي"
              subtitle="الاتصال بالطابعة عند فتح التطبيق"
              rightElement={
                <Switch
                  value={settings.autoConnect}
                  onValueChange={(value) => updateSettings({ autoConnect: value })}
                  trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                  thumbColor="white"
                />
              }
            />
            
            <SettingItem
              icon={Shield}
              title="الاتصال الآمن"
              subtitle="استخدام تشفير البيانات أثناء الطباعة"
              rightElement={
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: "#E5E5EA", true: "#4CAF50" }}
                  thumbColor="white"
                  disabled
                />
              }
            />
            
            <SettingItem
              icon={AlertCircle}
              title="تنبيهات الاتصال"
              subtitle="إظهار تنبيهات عند انقطاع الاتصال"
              rightElement={
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: "#E5E5EA", true: "#FF6B35" }}
                  thumbColor="white"
                />
              }
            />
          </SettingSection>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إعدادات الطباعة</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <SettingSection title="حالة الاتصال">
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: isConnected ? "#4CAF50" : "#FF5722" }]} />
            <Text style={styles.statusText}>
              {isConnected 
                ? `متصل بـ ${settings.selectedPrinter?.name || 'طابعة'}`
                : 'غير متصل'
              }
            </Text>
            {isConnected && (
              <TouchableOpacity 
                style={styles.disconnectButton}
                onPress={disconnectPrinter}
              >
                <Text style={styles.disconnectButtonText}>قطع الاتصال</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {settings.selectedPrinter && (
            <View style={styles.printerDetails}>
              <View style={styles.detailRow}>
                <Printer color="#666" size={16} />
                <Text style={styles.printerDetailText}>
                  الطابعة: {settings.selectedPrinter.name}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Bluetooth color="#666" size={16} />
                <Text style={styles.printerDetailText}>
                  العنوان: {settings.selectedPrinter.address}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Signal color={isConnected ? "#4CAF50" : "#666"} size={16} />
                <Text style={styles.printerDetailText}>
                  الحالة: {isConnected ? 'متصل وجاهز للطباعة' : 'غير متصل'}
                </Text>
              </View>
              {isConnected && (
                <View style={styles.detailRow}>
                  <Zap color="#FF6B35" size={16} />
                  <Text style={styles.printerDetailText}>
                    نوع الاتصال: بلوتوث منخفض الطاقة
                  </Text>
                </View>
              )}
            </View>
          )}
        </SettingSection>

        {/* Printer Selection */}
        <SettingSection title="اختيار الطابعة">
          <SettingItem
            icon={Search}
            title="البحث عن طابعات"
            subtitle={`البحث عن طابعات البلوتوث المتاحة (${availablePrinters.length} موجود)`}
            onPress={() => setShowPrinterModal(true)}
            rightElement={
              isScanning ? (
                <ActivityIndicator color="#FF6B35" size="small" />
              ) : null
            }
            showArrow
          />

          <SettingItem
            icon={RefreshCw}
            title="إعادة البحث السريع"
            subtitle="البحث مرة أخرى عن الطابعات القريبة"
            onPress={scanForPrinters}
            rightElement={
              isScanning ? (
                <ActivityIndicator color="#FF6B35" size="small" />
              ) : null
            }
          />

          <SettingItem
            icon={Wifi}
            title="طابعة الشبكة"
            subtitle="الاتصال بطابعة عبر الشبكة المحلية (قريباً)"
            onPress={() => Alert.alert('قريباً', 'هذه الميزة ستكون متاحة قريباً')}
            showArrow
          />
        </SettingSection>

        {/* Print Settings */}
        <SettingSection title="إعدادات الطباعة">
          <SettingItem
            icon={Settings}
            title="الإعدادات المتقدمة"
            subtitle="تخصيص تنسيق وشكل الفاتورة"
            onPress={() => setShowAdvancedSettings(true)}
            showArrow
          />

          <SettingItem
            icon={TestTube}
            title="اختبار الطباعة"
            subtitle="طباعة فاتورة تجريبية"
            onPress={handleTestPrint}
          />
        </SettingSection>

        {/* Quick Settings */}
        <SettingSection title="الإعدادات السريعة">
          <View style={styles.quickSettingsGrid}>
            <TouchableOpacity 
              style={styles.quickSettingItem}
              onPress={() => updateSettings({ paperWidth: 58 })}
            >
              <Text style={styles.quickSettingLabel}>58مم</Text>
              <Text style={styles.quickSettingSubtitle}>ورق صغير</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickSettingItem}
              onPress={() => updateSettings({ paperWidth: 80 })}
            >
              <Text style={styles.quickSettingLabel}>80مم</Text>
              <Text style={styles.quickSettingSubtitle}>ورق كبير</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickSettingItem}
              onPress={() => updateSettings({ fontSize: 10 })}
            >
              <Text style={styles.quickSettingLabel}>خط صغير</Text>
              <Text style={styles.quickSettingSubtitle}>10pt</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickSettingItem}
              onPress={() => updateSettings({ fontSize: 14 })}
            >
              <Text style={styles.quickSettingLabel}>خط كبير</Text>
              <Text style={styles.quickSettingSubtitle}>14pt</Text>
            </TouchableOpacity>
          </View>
        </SettingSection>
      </ScrollView>

      <PrinterModal />
      <AdvancedSettingsModal />
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  printerDetails: {
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  printerDetailText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginLeft: 8,
    flex: 1,
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
  numberInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  quickSettingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 8,
  },
  quickSettingItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  quickSettingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
    marginBottom: 4,
  },
  quickSettingSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  scanningContainer: {
    alignItems: "center",
    padding: 32,
  },
  scanningText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  printerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  connectedPrinter: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  printerIcon: {
    marginRight: 16,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  printerAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    textAlign: "right",
  },
  printerStatus: {
    marginLeft: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disconnectButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  printerMeta: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  printerTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  printerTypeText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  connectButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
});
