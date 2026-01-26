import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./styles/globals.css";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import NotificationPopup from "./components/NotificationPopup.jsx";
import Header from "./components/common/Header.jsx";
import HomePage from "./pages/public/HomePage.jsx";
import ServicesPage from "./pages/public/ServicesPage.jsx";
import AboutPage from "./pages/public/AboutPage.jsx";
import PricingPage from "./pages/public/PricingPage.jsx";
import ReviewPage from "./pages/public/ReviewPage.jsx";
import JoinSection from "./pages/public/JoinSection.jsx";
import Footer from "./pages/public/Footer.jsx";
import ShopPage from "./pages/shop/ShopPage.jsx";
import CartPage from "./pages/shop/CartPage.jsx";
import CheckoutPage from "./pages/shop/CheckoutPage.jsx";
import ShopBankingPayment from "./pages/shop/ShopBankingPayment.jsx";
import PaymentResultPage from "./pages/shop/PaymentResultPage.jsx";
import OrderSuccessPage from "./pages/shop/OrderSuccessPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import MemberLayout from "./components/layout/MemberLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminMembers from "./pages/admin/AdminMembers.jsx";
import Trainers from "./pages/admin/Trainers.jsx";
import AdminClasses from "./pages/admin/AdminClasses.jsx";
import AdminPlans from "./pages/admin/AdminPlans.jsx";
import AdminInvoices from "./pages/admin/AdminInvoices.jsx";
import AdminVoucher from "./pages/admin/AdminVoucher.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import MemberDashboard from "./pages/member/MemberDashboard.jsx";
import MemberProfile from "./pages/member/Profile.jsx";
import MemberSchedule from "./pages/member/MemberSchedule.jsx";
import BookClass from "./pages/member/BookClass.jsx";
import MemberPackages from "./pages/member/MemberPackages.jsx";
import CheckoutPackage from "./pages/member/CheckoutPackage.jsx";
import BankingPayment from "./pages/member/BankingPayment.jsx";
import MyOrders from "./pages/member/MyOrders.jsx";
import OrderDetail from "./pages/member/OrderDetail.jsx";
import TransactionHistory from "./pages/member/TransactionHistory.jsx";

function Landing() {
  return (
    <>
      <Header />
      <main>
        <HomePage />
        <ServicesPage />
        <AboutPage />
        <PricingPage />
        <ReviewPage />
        <JoinSection/>
        <Footer />
      </main>
      
    </>
  );
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function MemberRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== "member") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
          <NotificationPopup />
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/shop/banking-payment" element={<ShopBankingPayment />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="voucher" element={<AdminVoucher />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Member Routes */}
          <Route
            path="/member"
            element={
              <MemberRoute>
                <MemberLayout />
              </MemberRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="schedule" element={<MemberSchedule />} />
            <Route path="book-class" element={<BookClass />} />
            {/* <Route path="progress" element={<TrainingProgress />} /> */}
            <Route path="packages" element={<MemberPackages />} />
            <Route path="packages/checkout" element={<CheckoutPackage />} />
            <Route path="packages/payment" element={<BankingPayment />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="transactions" element={<TransactionHistory />} />
          </Route>

          <Route path="*" element={<Landing />} />
        </Routes>
        </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}