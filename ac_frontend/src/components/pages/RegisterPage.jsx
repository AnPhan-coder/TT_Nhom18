import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.code === 1000) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        setErrorMsg(response.data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.message || "Lỗi từ server");
      } else {
        setErrorMsg("Không thể kết nối đến Server");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng Ký Tài Khoản</h2>
        
        {/* Sử dụng class error-msg đã có trong index.css */}
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Họ và tên:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ tên đầy đủ..."
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>

          <div className="form-group">
            <label>Nhập lại mật khẩu:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu..."
              required
            />
          </div>

          {/* Thêm w-full để nút full chiều ngang, mt-4 tạo khoảng cách */}
          <button type="submit" className="btn-login w-full font-bold mt-2">
            ĐĂNG KÝ
          </button>
          
          <div className="mt-6 text-center text-sm text-neutral-500">
            Đã có tài khoản?{" "}
            <Link 
              to="/login" 
              className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors ml-1"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;