import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  description?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerPhone?: string;
  notes?: string;
  timestamp: string;
}

interface DatabaseContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id">) => string;
  getOrder: (id: string) => Order | undefined;
  getTodayStats: () => any;
  getReports: (period: "today" | "week" | "month") => any;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: "happy_time_products",
  CATEGORIES: "happy_time_categories",
  ORDERS: "happy_time_orders",
};

const defaultCategories: Category[] = [
  { id: "1", name: "سندوتشات" },
  { id: "2", name: "مشروبات" },
  { id: "3", name: "حلويات" },
  { id: "4", name: "سلطات" },
];

const defaultProducts: Product[] = [
  { id: "1", name: "سندوتش شاورما", price: 15, categoryId: "1", stock: 50 },
  { id: "2", name: "سندوتش فلافل", price: 8, categoryId: "1", stock: 30 },
  { id: "3", name: "سندوتش برجر", price: 20, categoryId: "1", stock: 25 },
  { id: "4", name: "عصير برتقال", price: 6, categoryId: "2", stock: 40 },
  { id: "5", name: "كولا", price: 4, categoryId: "2", stock: 60 },
  { id: "6", name: "كنافة", price: 12, categoryId: "3", stock: 15 },
  { id: "7", name: "سلطة فتوش", price: 10, categoryId: "4", stock: 20 },
];

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, ordersData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
      ]);

      setProducts(productsData ? JSON.parse(productsData) : defaultProducts);
      setCategories(categoriesData ? JSON.parse(categoriesData) : defaultCategories);
      setOrders(ordersData ? JSON.parse(ordersData) : []);

      // Save default data if not exists
      if (!productsData) {
        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      }
      if (!categoriesData) {
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error("Error saving products:", error);
    }
  };

  const saveOrders = async (newOrders: Order[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
      setOrders(newOrders);
    } catch (error) {
      console.error("Error saving orders:", error);
    }
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    const newProducts = [...products, newProduct];
    saveProducts(newProducts);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    const newProducts = products.map(product =>
      product.id === id ? { ...product, ...updatedProduct } : product
    );
    saveProducts(newProducts);
  };

  const deleteProduct = (id: string) => {
    const newProducts = products.filter(product => product.id !== id);
    saveProducts(newProducts);
  };

  const addOrder = (order: Omit<Order, "id">): string => {
    const orderId = Date.now().toString();
    const newOrder: Order = {
      ...order,
      id: orderId,
    };
    const newOrders = [...orders, newOrder];
    saveOrders(newOrders);

    // Update product stock
    const updatedProducts = products.map(product => {
      const orderItem = order.items.find(item => item.id === product.id);
      if (orderItem) {
        return { ...product, stock: Math.max(0, product.stock - orderItem.quantity) };
      }
      return product;
    });
    saveProducts(updatedProducts);

    return orderId;
  };

  const getOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.timestamp).toDateString() === today
    );

    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    return {
      todaySales: todaySales.toFixed(2),
      todayOrders: todayOrders.length,
      todayCustomers: todayOrders.length,
      averageOrder: averageOrder.toFixed(2),
      recentOrders: todayOrders.slice(-5).map(order => ({
        id: order.id,
        time: new Date(order.timestamp).toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: order.total.toFixed(2),
        status: 'completed',
      })),
    };
  };

  const getReports = (period: "today" | "week" | "month") => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const periodOrders = orders.filter(order => 
      new Date(order.timestamp) >= startDate
    );

    const totalSales = periodOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = periodOrders.length > 0 ? totalSales / periodOrders.length : 0;

    // Top products
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    periodOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Category performance
    const categoryPerformance = categories.map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const categoryRevenue = periodOrders.reduce((sum, order) => {
        return sum + order.items
          .filter(item => categoryProducts.some(p => p.id === item.id))
          .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      }, 0);

      return {
        id: category.id,
        name: category.name,
        revenue: categoryRevenue.toFixed(2),
        percentage: totalSales > 0 ? ((categoryRevenue / totalSales) * 100).toFixed(1) : "0",
      };
    });

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders: periodOrders.length,
      averageOrder: averageOrder.toFixed(2),
      newCustomers: periodOrders.length,
      topProducts,
      categoryPerformance,
      dailySales: [100, 150, 200, 180, 220, 190, 250], // Mock data
      recentTransactions: periodOrders.slice(-10).map(order => ({
        id: order.id,
        time: new Date(order.timestamp).toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: order.total.toFixed(2),
        items: order.items.length,
      })),
    };
  };

  const value: DatabaseContextType = {
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    getOrder,
    getTodayStats,
    getReports,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
