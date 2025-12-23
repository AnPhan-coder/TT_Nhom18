import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, History, LogOut } from "lucide-react";
import MyInfo from "./MyInfo";
import MyBookings from "./MyBookings";

const UserProfileMain = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user"); 
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="pt-24 pb-10 min-h-screen bg-neutral-900 text-white px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6 shadow-lg sticky top-24">
            <div className="flex flex-col items-center mb-8 border-b border-neutral-700 pb-6">
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-4xl font-bold text-neutral-900 mb-4 border-4 border-neutral-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white text-center">{user.name}</h2>
              <p className="text-sm text-neutral-400">{user.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "info"
                    ? "bg-yellow-500 text-neutral-900 shadow-md"
                    : "text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                <User size={20} /> Hồ Sơ Cá Nhân
              </button>
              
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "history"
                    ? "bg-yellow-500 text-neutral-900 shadow-md"
                    : "text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                <History size={20} /> Lịch Sử Giao Dịch
              </button>

              <div className="pt-4 mt-4 border-t border-neutral-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-900/20 transition-all"
                >
                  <LogOut size={20} /> Đăng Xuất
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-8 shadow-lg min-h-[600px]">
             {activeTab === "info" ? <MyInfo user={user} /> : <MyBookings user={user} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfileMain;