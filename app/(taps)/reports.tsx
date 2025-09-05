import React, { useState } from "react";
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
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react-native";
import { useDatabase } from "@/providers/DatabaseProvider";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const { getReports } = useDatabase();
  const reports = getReports(selectedPeriod);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    change,
  }: {
    title: string;
    value: string;
    icon: any;
    gradient: readonly [string, string, ...string[]];
    change?: string;
  }) => (
    <View style={[styles.statCard, { width: cardWidth }]}>
      <LinearGradient colors={gradient} style={styles.statGradient}>
        <View style={styles.statHeader}>
          <Icon color="white" size={24} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        {change && (
          <Text style={styles.statChange}>{change}</Text>
        )}
      </LinearGradient>
    </View>
  );

  const periods = [
    { key: "today", label: "اليوم" },
    { key: "week", label: "هذا الأسبوع" },
    { key: "month", label: "هذا الشهر" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>التقارير والإحصائيات</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="إجمالي المبيعات"
            value={`${reports.totalSales} د.ل`}
            icon={DollarSign}
            gradient={["#FF6B35", "#FF8A65"]}
            change="+12% من الأمس"
          />
          <StatCard
            title="عدد الطلبات"
            value={reports.totalOrders.toString()}
            icon={ShoppingBag}
            gradient={["#4CAF50", "#66BB6A"]}
            change="+8 طلبات"
          />
          <StatCard
            title="متوسط الطلب"
            value={`${reports.averageOrder} د.ل`}
            icon={TrendingUp}
            gradient={["#2196F3", "#42A5F5"]}
            change="+5% تحسن"
          />
          <StatCard
            title="العملاء الجدد"
            value={reports.newCustomers.toString()}
            icon={Calendar}
            gradient={["#9C27B0", "#BA68C8"]}
            change="+3 عملاء"
          />
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أكثر المنتجات مبيعاً</Text>
          <View style={styles.topProducts}>
            {reports.topProducts.map((product: any, index: number) => (
              <View key={product.id} style={styles.productItem}>
                <View style={styles.productRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSales}>
                    {product.quantity} وحدة - {product.revenue} د.ل
                  </Text>
                </View>
                <View style={styles.productProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(product.quantity / reports.topProducts[0].quantity) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sales Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مخطط المبيعات</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartPlaceholder}>
              <BarChart3 color="#FF6B35" size={48} />
              <Text style={styles.chartText}>مخطط المبيعات اليومية</Text>
              <Text style={styles.chartSubtext}>
                أعلى مبيعات: {Math.max(...reports.dailySales)} د.ل
              </Text>
            </View>
          </View>
        </View>

        {/* Category Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أداء الفئات</Text>
          <View style={styles.categoryPerformance}>
            {reports.categoryPerformance.map((category: any) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryRevenue}>{category.revenue} د.ل</Text>
                </View>
                <View style={styles.categoryChart}>
                  <PieChart color="#FF6B35" size={24} />
                  <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر المعاملات</Text>
          <View style={styles.transactions}>
            {reports.recentTransactions.map((transaction: any) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionId}>فاتورة #{transaction.id}</Text>
                  <Text style={styles.transactionTime}>{transaction.time}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.transactionTotal}>{transaction.total} د.ل</Text>
                  <Text style={styles.transactionItems}>{transaction.items} عنصر</Text>
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
    padding: 20,
    backgroundColor: "#FF6B35",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  periodButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButtonActive: {
    backgroundColor: "#FF6B35",
  },
  periodText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  periodTextActive: {
    color: "white",
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
    height: 140,
    justifyContent: "space-between",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  statTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "right",
  },
  statChange: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
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
  topProducts: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  productRank: {
    width: 32,
    height: 32,
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  productSales: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 2,
  },
  productProgress: {
    width: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartPlaceholder: {
    alignItems: "center",
    paddingVertical: 40,
  },
  chartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  chartSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  categoryPerformance: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  categoryRevenue: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 2,
  },
  categoryChart: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  transactions: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  transactionTime: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  transactionItems: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
