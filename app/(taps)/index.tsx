import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Clock,
  Star,
  ShoppingCart,
  Package,
  BarChart3
} from "lucide-react-native";
import { useDatabase } from "@/providers/DatabaseProvider";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const { getTodayStats } = useDatabase();
  const { currentUser } = useAuth();
  const stats = getTodayStats();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    gradient 
  }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    gradient: readonly [string, string, ...string[]];
  }) => (
    <TouchableOpacity style={[styles.statCard, { width: cardWidth }]}>
      <LinearGradient colors={gradient} style={styles.statGradient}>
        <View style={styles.statHeader}>
          <Icon color="white" size={24} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🍔</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>مرحباً {currentUser?.fullName}</Text>
              <Text style={styles.restaurantName}>هابي تايم</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Clock color="#666" size={16} />
            <Text style={styles.timeText}>
              {new Date().toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard
            title="مبيعات اليوم"
            value={`${stats.todaySales} د.ل`}
            icon={DollarSign}
            color="#FF6B35"
            gradient={["#FF6B35", "#FF8A65"]}
          />
          <StatCard
            title="عدد الطلبات"
            value={stats.todayOrders.toString()}
            icon={ShoppingBag}
            color="#4CAF50"
            gradient={["#4CAF50", "#66BB6A"]}
          />
          <StatCard
            title="العملاء"
            value={stats.todayCustomers.toString()}
            icon={Users}
            color="#2196F3"
            gradient={["#2196F3", "#42A5F5"]}
          />
          <StatCard
            title="متوسط الطلب"
            value={`${stats.averageOrder} د.ل`}
            icon={TrendingUp}
            color="#9C27B0"
            gradient={["#9C27B0", "#BA68C8"]}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/pos')}
            >
              <LinearGradient
                colors={["#FF6B35", "#FF8A65"]}
                style={styles.quickActionGradient}
              >
                <ShoppingCart color="white" size={28} />
              </LinearGradient>
              <Text style={styles.quickActionText}>طلب جديد</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/products')}
            >
              <LinearGradient
                colors={["#4CAF50", "#66BB6A"]}
                style={styles.quickActionGradient}
              >
                <Package color="white" size={28} />
              </LinearGradient>
              <Text style={styles.quickActionText}>إدارة المنتجات</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/reports')}
            >
              <LinearGradient
                colors={["#2196F3", "#42A5F5"]}
                style={styles.quickActionGradient}
              >
                <BarChart3 color="white" size={28} />
              </LinearGradient>
              <Text style={styles.quickActionText}>التقارير</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر الطلبات</Text>
          <View style={styles.recentOrders}>
            {stats.recentOrders.map((order: any, index: number) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>طلب #{order.id}</Text>
                  <Text style={styles.orderTime}>{order.time}</Text>
                </View>
                <View style={styles.orderAmount}>
                  <Text style={styles.orderPrice}>{order.total} د.ل</Text>
                  <View style={[styles.orderStatus, { 
                    backgroundColor: order.status === 'completed' ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.orderStatusText}>
                      {order.status === 'completed' ? 'مكتمل' : 'قيد التحضير'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    backgroundColor: "#FFF3F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "right",
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B35",
    textAlign: "right",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statGradient: {
    padding: 20,
    height: 120,
    justifyContent: "space-between",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "right",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "right",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAction: {
    alignItems: "center",
    gap: 12,
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },
  recentOrders: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  orderTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  orderAmount: {
    alignItems: "flex-end",
    gap: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
});
