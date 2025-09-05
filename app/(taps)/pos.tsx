import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Plus, Minus, ShoppingCart, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDatabase } from "@/providers/DatabaseProvider";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const itemWidth = (width - 48) / 2;

export default function POSScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { products, categories } = useDatabase();
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { currentUser } = useAuth();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartItemQuantity = (productId: string) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("تنبيه", "السلة فارغة");
      return;
    }
    router.push("/checkout");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>نقطة البيع - هابي تايم</Text>
            <Text style={styles.userInfo}>المستخدم: {currentUser?.fullName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={handleCheckout}>
          <ShoppingCart color="white" size={20} />
          {getTotalItems() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Left Panel - Products */}
        <View style={styles.leftPanel}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Search color="#666" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث عن منتج..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === "all" && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text style={[styles.categoryText, selectedCategory === "all" && styles.categoryTextActive]}>
                الكل
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products Grid */}
          <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.productsGrid}>
              {filteredProducts.map(product => {
                const quantity = getCartItemQuantity(product.id);
                return (
                  <View key={product.id} style={styles.productCard}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{product.price} د.ل</Text>
                      <Text style={styles.productStock}>المخزون: {product.stock}</Text>
                    </View>
                    
                    {quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <Plus color="white" size={20} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => removeFromCart(product.id)}
                        >
                          <Minus color="#FF6B35" size={16} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                        >
                          <Plus color="#FF6B35" size={16} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Right Panel - Cart */}
        <View style={styles.rightPanel}>
          <Text style={styles.cartTitle}>سلة التسوق</Text>
          
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <ShoppingCart color="#CCC" size={48} />
              <Text style={styles.emptyCartText}>السلة فارغة</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartItems}>
                {cart.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        {item.price} × {item.quantity} = {item.price * item.quantity} د.ل
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <X color="#FF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.cartSummary}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>المجموع:</Text>
                  <Text style={styles.totalAmount}>{getTotalPrice()} د.ل</Text>
                </View>
                
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <LinearGradient
                    colors={["#FF6B35", "#FF8A65"]}
                    style={styles.checkoutGradient}
                  >
                    <Text style={styles.checkoutText}>إتمام الطلب</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
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
    padding: 20,
    backgroundColor: "#FF6B35",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  userInfo: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cartButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 2,
    padding: 16,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E5EA",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryButtonActive: {
    backgroundColor: "#FF6B35",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "white",
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: itemWidth,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    color: "#FF6B35",
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  addButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  quantityButton: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    minWidth: 30,
    textAlign: "center",
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "right",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B35",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  cartItems: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  removeButton: {
    padding: 4,
  },
  cartSummary: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  checkoutGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
