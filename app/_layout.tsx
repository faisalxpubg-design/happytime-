import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { CartProvider } from "@/providers/CartProvider";
import { PrinterProvider } from "@/providers/PrinterProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import AuthGuard from "@/components/AuthGuard";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "رجوع" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: "إتمام الطلب",
          presentation: "modal",
          headerStyle: { backgroundColor: "#FF6B35" },
          headerTintColor: "white"
        }} 
      />
      <Stack.Screen 
        name="receipt/[id]" 
        options={{ 
          title: "الفاتورة",
          headerStyle: { backgroundColor: "#FF6B35" },
          headerTintColor: "white"
        }} 
      />
      <Stack.Screen 
        name="printer-settings" 
        options={{ 
          title: "إعدادات الطباعة",
          headerStyle: { backgroundColor: "#FF6B35" },
          headerTintColor: "white"
        }} 
      />
      <Stack.Screen 
        name="restaurant-settings" 
        options={{ 
          title: "إعدادات المطعم",
          headerStyle: { backgroundColor: "#FF6B35" },
          headerTintColor: "white"
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="user-management" 
        options={{ 
          title: "إدارة المستخدمين",
          headerStyle: { backgroundColor: "#FF6B35" },
          headerTintColor: "white"
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <DatabaseProvider>
            <PrinterProvider>
              <CartProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </CartProvider>
            </PrinterProvider>
          </DatabaseProvider>
        </AuthGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}
