import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Edit, Trash2, Package, Search } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDatabase } from "@/providers/DatabaseProvider";

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    categoryId: "",
    stock: "",
    description: "",
  });

  const { products, categories, addProduct, updateProduct, deleteProduct } = useDatabase();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const productData = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      categoryId: "",
      stock: "",
      description: "",
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const handleEditProduct = (product: any) => {
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      description: product.description || "",
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا المنتج؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف", style: "destructive", onPress: () => deleteProduct(productId) },
      ]
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "غير محدد";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة المنتجات</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

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

      {/* Products List */}
      <ScrollView style={styles.productsList} showsVerticalScrollIndicator={false}>
        {filteredProducts.map(product => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productIcon}>
              <Package color="#FF6B35" size={24} />
            </View>
            
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{getCategoryName(product.categoryId)}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productPrice}>{product.price} د.ل</Text>
                <Text style={[
                  styles.productStock,
                  { color: product.stock > 10 ? "#4CAF50" : product.stock > 0 ? "#FF9800" : "#F44336" }
                ]}>
                  المخزون: {product.stock}
                </Text>
              </View>
            </View>
            
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditProduct(product)}
              >
                <Edit color="#2196F3" size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProduct(product.id)}
              >
                <Trash2 color="#F44336" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelButton}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </Text>
            <TouchableOpacity onPress={handleSaveProduct}>
              <Text style={styles.saveButton}>حفظ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم المنتج *</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                placeholder="أدخل اسم المنتج"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>السعر *</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.price}
                onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
                placeholder="0.00"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الفئة *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        newProduct.categoryId === category.id && styles.categoryOptionSelected
                      ]}
                      onPress={() => setNewProduct({ ...newProduct, categoryId: category.id })}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        newProduct.categoryId === category.id && styles.categoryOptionTextSelected
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الكمية في المخزون</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.stock}
                onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
                placeholder="0"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الوصف</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
                placeholder="وصف المنتج (اختياري)"
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
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
    padding: 20,
    backgroundColor: "#FF6B35",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
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
  productsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF3F0",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  productStock: {
    fontSize: 12,
    fontWeight: "600",
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
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
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "right",
  },
  textInput: {
    backgroundColor: "white",
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
  categorySelector: {
    flexDirection: "row",
    gap: 12,
  },
  categoryOption: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  categoryOptionSelected: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#333",
  },
  categoryOptionTextSelected: {
    color: "white",
  },
});
