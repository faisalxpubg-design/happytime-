import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CreditCard, Banknote, Smartphone, Receipt, ArrowLeft } from "lucide-react-native";
import { useCart } from "@/providers/CartProvider";
import { useDatabase } from "@/providers/DatabaseProvider";
import { usePrinter } from "@/providers/PrinterProvider";
import { router } from "expo-router";

export default function CheckoutScreen() {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");

  const { cart, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useDatabase();
  const { printReceipt, isConnected } = usePrinter();

  const subtotal = getTotalPrice();
  const discountAmount = discount ? (subtotal * parseFloat(discount)) / 100 : 0;
  const total = subtotal - discountAmount;

  const paymentMethods = [
    { key: "cash", label: "نقداً", icon: Banknote },
    { key: "card", label: "بطاقة", icon: CreditCard },
    { key: "mobile", label: "محفظة رقمية", icon: Smartphone },
  ];

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("خطأ", "السلة فارغة");
      return;
    }

    const order = {
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      customerName: customerName || "عميل",
      customerPhone,
      notes,
      timestamp: new Date().toISOString(),
    };

    const orderId = addOrder(order);
    clearCart();
    
    // Auto-print if printer is connected
    if (isConnected) {
      const receiptData = {
        order: { ...order, id: orderId },
        restaurantInfo: {
          name: 'هابي تايم',
          subtitle: 'مطعم السندوتشات الشهية',
        },
      };
      
      try {
        await printReceipt(receiptData);
        Alert.alert(
          "تم إنشاء الطلب",
          `رقم الطلب: ${orderId}\nتم إرسال الفاتورة للطباعة`,
          [
            { text: "عرض الفاتورة", onPress: () => router.push(`/receipt/${orderId}`) },
            { text: "طلب جديد", onPress: () => router.back() },
          ]
        );
      } catch (error) {
        Alert.alert(
          "تم إنشاء الطلب",
          `رقم الطلب: ${orderId}\nفشل في الطباعة التلقائية`,
          [
            { text: "طباعة الفاتورة", onPress: () => router.push(`/receipt/${orderId}`) },
            { text: "طلب جديد", onPress: () => router.back() },
          ]
        );
      }
    } else {
      Alert.alert(
        "تم إنشاء الطلب",
        `رقم الطلب: ${orderId}`,
        [
          { text: "طباعة الفاتورة", onPress: () => router.push(`/receipt/${orderId}`) },
          { text: "طلب جديد", onPress: () => router.back() },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الطلب</Text>
          <View style={styles.orderSummary}>
            {cart.map(item => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantity} × {item.price} = {item.quantity * item.price} د.ل
                </Text>
              </View>
            ))}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>المجموع الفرعي:</Text>
              <Text style={styles.summaryValue}>{subtotal} د.ل</Text>
            </View>
            
            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: "#4CAF50" }]}>الخصم:</Text>
                <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>-{discountAmount} د.ل</Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>المجموع النهائي:</Text>
              <Text style={styles.totalValue}>{total} د.ل</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.customerInfo}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم العميل (اختياري)</Text>
              <TextInput
                style={styles.textInput}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="أدخل اسم العميل"
                textAlign="right"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم الهاتف (اختياري)</Text>
              <TextInput
                style={styles.textInput}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="أدخل رقم الهاتف"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        {/* Discount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخصم</Text>
          <View style={styles.discountContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نسبة الخصم (%)</Text>
              <TextInput
                style={styles.textInput}
                value={discount}
                onChangeText={setDiscount}
                placeholder="0"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طريقة الدفع</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method.key && styles.paymentMethodSelected
                  ]}
                  onPress={() => setPaymentMethod(method.key as any)}
                >
                  <Icon 
                    color={paymentMethod === method.key ? "white" : "#FF6B35"} 
                    size={24} 
                  />
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === method.key && styles.paymentMethodTextSelected
                  ]}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملاحظات</Text>
          <View style={styles.notesContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="ملاحظات إضافية (اختياري)"
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>
        </View>
      </ScrollView>

      {/* Complete Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteOrder}>
          <LinearGradient
            colors={["#FF6B35", "#FF8A65"]}
            style={styles.completeGradient}
          >
            <Receipt color="white" size={20} />
            <Text style={styles.completeText}>إتمام الطلب - {total} د.ل</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "right",
  },
  orderSummary: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  customerInfo: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  discountContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodSelected: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  paymentMethodTextSelected: {
    color: "white",
  },
  notesContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  completeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  completeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  completeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
