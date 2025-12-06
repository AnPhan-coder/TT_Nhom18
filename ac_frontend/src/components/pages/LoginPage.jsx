import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email,
          password: password,
        }
      );

if (response.data.code === 1000) {
    const data = response.data.result;
    
    const realId = data.userID; 
    if (!realId) {
        alert("Lỗi nghiêm trọng: Backend không trả về ID người dùng!");
        return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
        id: realId, 
        name: data.name,
        role: data.role
    }));
    window.dispatchEvent(new Event("auth-change"));
    alert("Đăng nhập thành công!");
    const role = data.role ? data.role.toUpperCase() : "CUSTOMER";

if (role === "ADMIN") {
    navigate("/admin/dashboard"); 
} else {
    navigate("/");
}
}
        
      else {
        setErrorMsg(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);

      if (error.response && error.response.data) {
        const serverMsg =
          error.response.data.message || JSON.stringify(error.response.data);
        setErrorMsg(serverMsg);
      } else {
        setErrorMsg(
          "Không thể kết nối đến Server"
        );
      }
    }
  };
const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:8080/api/auth/google", {
        token: credentialResponse.credential
      });

      if (response.data.code === 1000) {
        const data = response.data.result;
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            id: data.userID,
            name: data.name,
            role: data.role
        }));
        alert("Đăng nhập Google thành công!");
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Lỗi Google Login:", error);
      setErrorMsg("Đăng nhập Google thất bại!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng Nhập</h2>
        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>
          <div className="flex justify-end mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors italic"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <button type="submit" className="btn-login w-full font-bold">
            ĐĂNG NHẬP
          </button>
          <div className="mt-6">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-neutral-800 text-neutral-500">Hoặc tiếp tục với</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setErrorMsg("Đăng nhập Google thất bại");
                    }}
                    useOneTap
                    theme="filled_black" 
                    text="signin_with"
                    shape="circle"
                />
            </div>
        </div>
          <div className="mt-6 text-center text-sm text-neutral-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors ml-1"
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
