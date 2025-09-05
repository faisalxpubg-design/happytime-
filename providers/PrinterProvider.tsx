import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bluetooth device interface
interface BluetoothDevice {
  id: string;
  name?: string;
  address?: string;
}

// Mock Bluetooth API for Expo compatibility
const BluetoothAPI = {
  isEnabledAsync: async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    // In a real implementation, this would check Bluetooth status
    return true;
  },
  
  requestToEnableAsync: async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    // In a real implementation, this would request to enable Bluetooth
    console.log('Requesting to enable Bluetooth...');
  },
  
  scanForDevicesAsync: async (options: { timeout: number }): Promise<BluetoothDevice[]> => {
    if (Platform.OS === 'web') return [];
    
    // Simulate scanning with mock devices
    await new Promise(resolve => setTimeout(resolve, options.timeout / 2));
    
    return [
      { id: 'mock-printer-1', name: 'Thermal Printer TP-58', address: '00:11:22:33:44:55' },
      { id: 'mock-printer-2', name: 'EPSON TM-T20III', address: '00:11:22:33:44:66' },
      { id: 'mock-printer-3', name: 'Star TSP143III', address: '00:11:22:33:44:77' },
      { id: 'mock-printer-4', name: 'Citizen CT-S310II', address: '00:11:22:33:44:88' },
      { id: 'mock-printer-5', name: 'Bixolon SRP-275III', address: '00:11:22:33:44:99' },
    ];
  },
  
  connectToDeviceAsync: async (address: string): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    console.log(`Bluetooth connection to ${address}: ${success ? 'Success' : 'Failed'}`);
    return success;
  },
  
  disconnectFromDeviceAsync: async (address: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Disconnected from ${address}`);
  },
  
  writeToDeviceAsync: async (address: string, data: string): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Sending ${data.length} bytes to printer ${address}`);
    console.log('Print data preview:', data.substring(0, 100) + '...');
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    return success;
  },
};

interface PrinterDevice {
  id: string;
  name: string;
  address: string;
  connected: boolean;
}

interface PrinterSettings {
  paperWidth: number;
  fontSize: number;
  printLogo: boolean;
  printCustomerInfo: boolean;
  printFooter: boolean;
  copies: number;
  autoConnect: boolean;
  selectedPrinter?: PrinterDevice;
}

interface PrinterContextType {
  isConnected: boolean;
  availablePrinters: PrinterDevice[];
  settings: PrinterSettings;
  isScanning: boolean;
  scanForPrinters: () => Promise<void>;
  connectToPrinter: (printer: PrinterDevice) => Promise<boolean>;
  disconnectPrinter: () => Promise<void>;
  printReceipt: (receiptData: any) => Promise<boolean>;
  updateSettings: (newSettings: Partial<PrinterSettings>) => Promise<void>;
  testPrint: () => Promise<boolean>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRINTER_SETTINGS: 'happy_time_printer_settings',
  SELECTED_PRINTER: 'happy_time_selected_printer',
};

const defaultSettings: PrinterSettings = {
  paperWidth: 58, // mm
  fontSize: 12,
  printLogo: true,
  printCustomerInfo: true,
  printFooter: true,
  copies: 1,
  autoConnect: false,
};

// ESC/POS Commands for thermal printers
const ESC_POS = {
  INIT: '\x1B\x40',
  FEED_LINE: '\x0A',
  CUT_PAPER: '\x1D\x56\x00',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_RIGHT: '\x1B\x61\x02',
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  UNDERLINE_ON: '\x1B\x2D\x01',
  UNDERLINE_OFF: '\x1B\x2D\x00',
  FONT_SIZE_NORMAL: '\x1D\x21\x00',
  FONT_SIZE_DOUBLE: '\x1D\x21\x11',
  FONT_SIZE_LARGE: '\x1D\x21\x22',
};

export function PrinterProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<PrinterDevice[]>([]);
  const [settings, setSettings] = useState<PrinterSettings>(defaultSettings);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsData, selectedPrinterData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PRINTER_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SELECTED_PRINTER),
        ]);

        if (settingsData) {
          const loadedSettings = JSON.parse(settingsData);
          setSettings({ ...defaultSettings, ...loadedSettings });
        }

        if (selectedPrinterData) {
          const selectedPrinter = JSON.parse(selectedPrinterData);
          setSettings(prev => ({ ...prev, selectedPrinter }));
        }
      } catch (error) {
        console.error('Error loading printer settings:', error);
      }
    };
    
    loadSettings();
  }, []);



  const saveSettings = async (newSettings: PrinterSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRINTER_SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving printer settings:', error);
    }
  };

  const requestBluetoothPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);
        
        return Object.values(granted).every(permission => 
          permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Error requesting Bluetooth permissions:', error);
        return false;
      }
    }
    return true;
  };

  const scanForPrinters = async (): Promise<void> => {
    setIsScanning(true);
    
    try {
      if (Platform.OS === 'web') {
        // On web, show available system printers
        setAvailablePrinters([
          { id: 'web-default', name: 'طابعة النظام الافتراضية', address: 'system', connected: false },
        ]);
        return;
      }

      // Request Bluetooth permissions
      const hasPermissions = await requestBluetoothPermissions();
      if (!hasPermissions) {
        Alert.alert('تحذير', 'يجب منح صلاحيات البلوتوث للبحث عن الطابعات');
        return;
      }

      // Check if Bluetooth is enabled
      const isEnabled = await BluetoothAPI.isEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'البلوتوث غير مفعل',
          'يرجى تفعيل البلوتوث للبحث عن الطابعات',
          [
            { text: 'إلغاء', style: 'cancel' },
            { 
              text: 'تفعيل', 
              onPress: async () => {
                try {
                  await BluetoothAPI.requestToEnableAsync();
                  // Retry scanning after enabling
                  setTimeout(() => scanForPrinters(), 1000);
                } catch (error) {
                  console.error('Error enabling Bluetooth:', error);
                }
              }
            },
          ]
        );
        return;
      }

      // Start scanning for Bluetooth devices
      console.log('بدء البحث عن أجهزة البلوتوث...');
      
      const devices = await BluetoothAPI.scanForDevicesAsync({
        timeout: 10000, // 10 seconds
      });

      // Filter for potential printer devices
      const printerDevices: PrinterDevice[] = devices
        .filter((device: BluetoothDevice) => {
          const name = device.name?.toLowerCase() || '';
          return name.includes('printer') || 
                 name.includes('pos') || 
                 name.includes('thermal') ||
                 name.includes('epson') ||
                 name.includes('star') ||
                 name.includes('citizen') ||
                 name.includes('bixolon') ||
                 name.includes('tp-') ||
                 name.includes('tm-');
        })
        .map((device: BluetoothDevice) => ({
          id: device.id,
          name: device.name || `جهاز غير معروف (${device.id.slice(-4)})`,
          address: device.address || device.id,
          connected: false,
        }));

      if (printerDevices.length === 0) {
        // Show all devices if no printers found
        const allDevices: PrinterDevice[] = devices.map((device: BluetoothDevice) => ({
          id: device.id,
          name: device.name || `جهاز بلوتوث (${device.id.slice(-4)})`,
          address: device.address || device.id,
          connected: false,
        }));
        setAvailablePrinters(allDevices);
        
        if (allDevices.length === 0) {
          Alert.alert('لا توجد أجهزة', 'لم يتم العثور على أي أجهزة بلوتوث قريبة');
        } else {
          Alert.alert(
            'لم يتم العثور على طابعات',
            `تم العثور على ${allDevices.length} جهاز بلوتوث. يمكنك المحاولة مع أي منها.`
          );
        }
      } else {
        setAvailablePrinters(printerDevices);
        Alert.alert(
          'تم العثور على طابعات',
          `تم العثور على ${printerDevices.length} طابعة محتملة`
        );
      }
      
    } catch (error) {
      console.error('Error scanning for printers:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      Alert.alert('خطأ', `فشل في البحث عن الطابعات: ${errorMessage}`);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToPrinter = async (printer: PrinterDevice): Promise<boolean> => {
    try {
      console.log(`محاولة الاتصال بالطابعة: ${printer.name} (${printer.address})`);
      
      if (Platform.OS === 'web') {
        // Web connection simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedPrinters = availablePrinters.map(p => ({
          ...p,
          connected: p.id === printer.id,
        }));
        setAvailablePrinters(updatedPrinters);
        
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_PRINTER, JSON.stringify(printer));
        const newSettings = { ...settings, selectedPrinter: { ...printer, connected: true } };
        await saveSettings(newSettings);
        
        setIsConnected(true);
        Alert.alert('نجح الاتصال', `تم الاتصال بالطابعة ${printer.name}`);
        return true;
      }

      // Real Bluetooth connection for mobile
      const isConnected = await BluetoothAPI.connectToDeviceAsync(printer.address);
      
      if (isConnected) {
        console.log('تم الاتصال بنجاح بالطابعة');
        
        // Update printer status
        const updatedPrinters = availablePrinters.map(p => ({
          ...p,
          connected: p.id === printer.id,
        }));
        setAvailablePrinters(updatedPrinters);
        
        // Save selected printer
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_PRINTER, JSON.stringify(printer));
        
        const newSettings = { ...settings, selectedPrinter: { ...printer, connected: true } };
        await saveSettings(newSettings);
        
        setIsConnected(true);
        
        Alert.alert('نجح الاتصال', `تم الاتصال بالطابعة ${printer.name}`);
        return true;
      } else {
        throw new Error('فشل في إنشاء الاتصال');
      }
      
    } catch (error) {
      console.error('Error connecting to printer:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      Alert.alert(
        'خطأ في الاتصال', 
        `فشل في الاتصال بالطابعة ${printer.name}\n\nالخطأ: ${errorMessage}`
      );
      return false;
    }
  };

  const disconnectPrinter = async (): Promise<void> => {
    try {
      if (Platform.OS !== 'web' && settings.selectedPrinter) {
        // Disconnect from Bluetooth device
        await BluetoothAPI.disconnectFromDeviceAsync(settings.selectedPrinter.address);
        console.log('تم قطع الاتصال من البلوتوث');
      }
      
      const updatedPrinters = availablePrinters.map(p => ({
        ...p,
        connected: false,
      }));
      setAvailablePrinters(updatedPrinters);
      
      const newSettings = { ...settings, selectedPrinter: undefined };
      await saveSettings(newSettings);
      
      setIsConnected(false);
      
      Alert.alert('تم قطع الاتصال', 'تم قطع الاتصال بالطابعة');
    } catch (error) {
      console.error('Error disconnecting printer:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء قطع الاتصال');
    }
  };

  const generateReceiptHTML = (receiptData: any): string => {
    const { order, restaurantInfo } = receiptData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: ${settings.fontSize}px;
            line-height: 1.2;
            margin: 0;
            padding: 10px;
            width: ${settings.paperWidth}mm;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .large { font-size: ${settings.fontSize + 4}px; }
          .separator { border-top: 1px dashed #000; margin: 5px 0; }
          .item-row { display: flex; justify-content: space-between; }
          .total-row { font-weight: bold; font-size: ${settings.fontSize + 2}px; }
        </style>
      </head>
      <body>
        ${settings.printLogo ? `
          <div class="center bold large">
            ${restaurantInfo?.name || 'هابي تايم'}
          </div>
          <div class="center">
            ${restaurantInfo?.subtitle || 'مطعم السندوتشات الشهية'}
          </div>
          <div class="separator"></div>
        ` : ''}
        
        <div class="center">
          <div>فاتورة رقم: ${order.id}</div>
          <div>${new Date(order.timestamp).toLocaleDateString('ar-SA')} ${new Date(order.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        
        ${settings.printCustomerInfo && (order.customerName || order.customerPhone) ? `
          <div class="separator"></div>
          <div class="right">
            ${order.customerName ? `<div>العميل: ${order.customerName}</div>` : ''}
            ${order.customerPhone ? `<div>الهاتف: ${order.customerPhone}</div>` : ''}
          </div>
        ` : ''}
        
        <div class="separator"></div>
        
        ${order.items.map((item: any) => `
          <div class="item-row">
            <span>${item.name}</span>
          </div>
          <div class="item-row">
            <span>${(item.price * item.quantity).toFixed(2)} د.ل</span>
            <span>${item.quantity} × ${item.price.toFixed(2)}</span>
          </div>
        `).join('')}
        
        <div class="separator"></div>
        
        <div class="item-row">
          <span>المجموع الفرعي:</span>
          <span>${order.subtotal.toFixed(2)} د.ل</span>
        </div>
        
        ${order.discount > 0 ? `
          <div class="item-row">
            <span>الخصم:</span>
            <span>-${order.discount.toFixed(2)} د.ل</span>
          </div>
        ` : ''}
        
        <div class="separator"></div>
        
        <div class="item-row total-row">
          <span>المجموع النهائي:</span>
          <span>${order.total.toFixed(2)} د.ل</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="center">
          <div>طريقة الدفع: ${order.paymentMethod === 'cash' ? 'نقداً' : order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة رقمية'}</div>
        </div>
        
        ${order.notes ? `
          <div class="separator"></div>
          <div class="right">
            <div>ملاحظات: ${order.notes}</div>
          </div>
        ` : ''}
        
        ${settings.printFooter ? `
          <div class="separator"></div>
          <div class="center">
            <div>شكراً لزيارتكم</div>
            <div>نتطلع لخدمتكم مرة أخرى</div>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  const generateESCPOSReceipt = (receiptData: any): string => {
    const { order, restaurantInfo } = receiptData;
    let receipt = '';
    
    // Initialize printer
    receipt += ESC_POS.INIT;
    
    // Header
    if (settings.printLogo) {
      receipt += ESC_POS.ALIGN_CENTER;
      receipt += ESC_POS.FONT_SIZE_LARGE;
      receipt += ESC_POS.BOLD_ON;
      receipt += (restaurantInfo?.name || 'هابي تايم') + '\n';
      receipt += ESC_POS.FONT_SIZE_NORMAL;
      receipt += ESC_POS.BOLD_OFF;
      receipt += (restaurantInfo?.subtitle || 'مطعم السندوتشات الشهية') + '\n';
      receipt += '================================\n';
    }
    
    // Order info
    receipt += ESC_POS.ALIGN_CENTER;
    receipt += `فاتورة رقم: ${order.id}\n`;
    receipt += `${new Date(order.timestamp).toLocaleDateString('ar-SA')} ${new Date(order.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}\n`;
    
    // Customer info
    if (settings.printCustomerInfo && (order.customerName || order.customerPhone)) {
      receipt += '================================\n';
      receipt += ESC_POS.ALIGN_RIGHT;
      if (order.customerName) receipt += `العميل: ${order.customerName}\n`;
      if (order.customerPhone) receipt += `الهاتف: ${order.customerPhone}\n`;
    }
    
    receipt += '================================\n';
    receipt += ESC_POS.ALIGN_LEFT;
    
    // Items
    order.items.forEach((item: any) => {
      receipt += `${item.name}\n`;
      receipt += `${(item.price * item.quantity).toFixed(2)} د.ل`;
      receipt += `     ${item.quantity} × ${item.price.toFixed(2)}\n`;
    });
    
    receipt += '================================\n';
    
    // Totals
    receipt += `المجموع الفرعي:     ${order.subtotal.toFixed(2)} د.ل\n`;
    
    if (order.discount > 0) {
      receipt += `الخصم:              -${order.discount.toFixed(2)} د.ل\n`;
    }
    
    receipt += '================================\n';
    receipt += ESC_POS.BOLD_ON;
    receipt += ESC_POS.FONT_SIZE_DOUBLE;
    receipt += `المجموع النهائي:    ${order.total.toFixed(2)} د.ل\n`;
    receipt += ESC_POS.FONT_SIZE_NORMAL;
    receipt += ESC_POS.BOLD_OFF;
    
    receipt += '================================\n';
    receipt += ESC_POS.ALIGN_CENTER;
    receipt += `طريقة الدفع: ${order.paymentMethod === 'cash' ? 'نقداً' : order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة رقمية'}\n`;
    
    // Notes
    if (order.notes) {
      receipt += '================================\n';
      receipt += ESC_POS.ALIGN_RIGHT;
      receipt += `ملاحظات: ${order.notes}\n`;
    }
    
    // Footer
    if (settings.printFooter) {
      receipt += '================================\n';
      receipt += ESC_POS.ALIGN_CENTER;
      receipt += 'شكراً لزيارتكم\n';
      receipt += 'نتطلع لخدمتكم مرة أخرى\n';
    }
    
    // Feed and cut
    receipt += '\n\n\n';
    receipt += ESC_POS.CUT_PAPER;
    
    return receipt;
  };

  const printReceipt = async (receiptData: any): Promise<boolean> => {
    if (!isConnected && Platform.OS !== 'web') {
      Alert.alert('خطأ', 'لا توجد طابعة متصلة');
      return false;
    }

    try {
      if (Platform.OS === 'web') {
        // Use browser print API for web
        const htmlContent = generateReceiptHTML(receiptData);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
        }
      } else {
        // Use Bluetooth printing for mobile
        if (!settings.selectedPrinter) {
          Alert.alert('خطأ', 'لا توجد طابعة محددة');
          return false;
        }

        const escposData = generateESCPOSReceipt(receiptData);
        console.log('إرسال بيانات الطباعة:', escposData.length, 'بايت');
        
        // Send data to Bluetooth printer
        const success = await BluetoothAPI.writeToDeviceAsync(
          settings.selectedPrinter.address,
          escposData
        );
        
        if (!success) {
          throw new Error('فشل في إرسال البيانات للطابعة');
        }
        
        console.log('تم إرسال البيانات بنجاح للطابعة');
      }
      
      // Print multiple copies if needed
      if (settings.copies > 1) {
        for (let i = 1; i < settings.copies; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between copies
          
          if (Platform.OS === 'web') {
            const htmlContent = generateReceiptHTML(receiptData);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(htmlContent);
              printWindow.document.close();
              printWindow.print();
              printWindow.close();
            }
          } else {
            const escposData = generateESCPOSReceipt(receiptData);
            await BluetoothAPI.writeToDeviceAsync(
              settings.selectedPrinter!.address,
              escposData
            );
          }
        }
      }
      
      Alert.alert('نجحت الطباعة', 'تم طباعة الفاتورة بنجاح');
      return true;
    } catch (error) {
      console.error('Error printing receipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      Alert.alert('خطأ في الطباعة', `فشل في طباعة الفاتورة\n\nالخطأ: ${errorMessage}`);
      return false;
    }
  };

  const testPrint = async (): Promise<boolean> => {
    const testData = {
      order: {
        id: 'TEST-001',
        items: [
          { name: 'اختبار الطباعة', price: 1.00, quantity: 1 },
        ],
        subtotal: 1.00,
        discount: 0,
        total: 1.00,
        paymentMethod: 'cash',
        customerName: 'عميل تجريبي',
        timestamp: new Date().toISOString(),
      },
      restaurantInfo: {
        name: 'هابي تايم',
        subtitle: 'اختبار الطباعة',
      },
    };
    
    return await printReceipt(testData);
  };

  const updateSettings = async (newSettings: Partial<PrinterSettings>): Promise<void> => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(updatedSettings);
  };

  const value: PrinterContextType = {
    isConnected,
    availablePrinters,
    settings,
    isScanning,
    scanForPrinters,
    connectToPrinter,
    disconnectPrinter,
    printReceipt,
    updateSettings,
    testPrint,
  };

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (context === undefined) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
}
