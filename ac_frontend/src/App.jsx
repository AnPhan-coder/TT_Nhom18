import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import ProfilePage from './components/pages/ProfilePage';
import MovieList from './components/pages/MovieList';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

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
      <div className="App min-h-screen flex flex-col font-body">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/movies" element={<MovieList />} />
            
            <Route path="/booking/:showtimeId" element={<BookingPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />

            <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;