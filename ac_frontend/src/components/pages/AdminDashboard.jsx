import React, { useState } from "react";
import ManageShowtimes from "./ManageShowtimes";
import MovieList from "./MovieList";
import ManageRooms from "./ManageRooms";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("movies");
  const renderContent = () => {
    switch (activeTab) {
      case "movies":
        return <MovieList />;
      case "showtimes":
        return <ManageShowtimes />;
      case "rooms":
        return <ManageRooms />;
      case "stats":
        return (
          <div className="text-white">
            Chức năng thống kê đang phát triển...
          </div>
        );
      default:
        return <MovieList />;
    }
  };
  return (
    <div className="pt-24 px-8 min-h-screen bg-neutral-900 text-white">
      <h1 className="text-3xl font-bold text-yellow-500 mb-8">
        Trang Quản Trị (Admin Dashboard)
      </h1>
      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700 gap-4 mb-8">
        <p>Chào mừng Admin quay trở lại!</p>
        <p>Tại đây bạn sẽ quản lý Phim, Suất chiếu và Đơn hàng.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-neutral-800 p-6 rounded-lg h-fit">
          <h3 className="text-xl text-yellow-500 font-bold mb-4">Menu</h3>
          <ul className="space-y-2 text-neutral-400">
            <li className="p-2 hover:bg-neutral-700 rounded cursor-pointer">
              <button
                onClick={() => setActiveTab("movies")}
                className={`px-4 py-2 rounded font-bold ${
                  activeTab === "movies"
                    ? "bg-neutral-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Quản lý Phim
              </button>
            </li>
            <li className="p-2 hover:bg-neutral-700 rounded cursor-pointer">
              <button
                onClick={() => setActiveTab("showtimes")}
                className={`px-4 py-2 rounded font-bold ${
                  activeTab === "showtimes"
                    ? "bg-neutral-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Quản lý Lịch chiếu
              </button>
            </li>
            <li className="p-2 hover:bg-neutral-700 rounded cursor-pointer">
              <button
                onClick={() => setActiveTab("rooms")}
                className={`px-4 py-2 rounded font-bold ${
                  activeTab === "rooms"
                    ? "bg-neutral-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Quản lý Phòng Chiếu
              </button>
            </li>
            <li className="p-2 hover:bg-neutral-700 rounded cursor-pointer">
              Thống kê
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">{renderContent()} </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
