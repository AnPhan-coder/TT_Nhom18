import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ... (Giữ nguyên các import Page của bạn) ...
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import MovieDetail from './components/pages/MovieDetail'; 
import BookingPage from './components/pages/BookingPage';
import ScrollToTop from './components/pages/ScrollToTop';
import RegisterPage from './components/pages/RegisterPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import AdminRoute from './components/pages/AdminRoute';
import AdminDashboard from './components/pages/AdminDashboard';
import PaymentPage from './components/pages/PaymentPage';
import MovieList from './components/pages/MovieList';
import ManageUsers from './components/pages/ManageUsers';
import UserProfile from './components/pages/UserProfileMain';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// 1. Tạo một Component con để xử lý Layout
const AppContent = () => {
  const location = useLocation(); // Hook này sẽ chạy lại mỗi khi đổi trang
  
  // Logic: Ẩn Footer nếu đường dẫn BẮT ĐẦU bằng /admin (bao gồm dashboard, users, movies...)
  const isAdminRoute = location.pathname.startsWith('/admin'); 

  return (
    <div className="App min-h-screen flex flex-col font-body">
      <Header />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/movies" element={<MovieList />} />
          
          <Route path="/booking/:showtimeId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />

          {/* Các Route Admin */}
          <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              {/* Thêm các route admin khác vào đây nếu có */}
          </Route>
        </Routes>
      </main>
      
      {/* Chỉ hiện Footer nếu KHÔNG phải trang Admin */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

// 2. Component App chính chỉ chứa Router và bọc AppContent
function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" 
      />
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;