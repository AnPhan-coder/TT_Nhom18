import React, { useState } from "react";
import ManageShowtimes from "./ManageShowtimes";
import MovieList from "./MovieList";
import ManageRooms from "./ManageRooms";
import ManageUsers from "./ManageUsers";
import AdminStats from "./AdminStats";

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
      case "users":
        return <ManageUsers />;
      case "stats":
        return <AdminStats />;
      default:
        return <MovieList />;
    }
  };
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col pt-20">
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto">
        <aside className="w-64 lg:w-72 bg-neutral-800 border-r border-neutral-700 shrink-0 hidden md:block min-h-screen">
          <div className="p-6 fixed w-64 lg:w-72 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-yellow-500 mb-8 uppercase tracking-widest">
              Trang Quản Trị
            </h2>

            <nav className="space-y-2">
              <SidebarItem
                label="Quản lý Phim"
                active={activeTab === "movies"}
                onClick={() => setActiveTab("movies")}
              />
              <SidebarItem
                label="Quản lý Lịch chiếu"
                active={activeTab === "showtimes"}
                onClick={() => setActiveTab("showtimes")}
              />
              <SidebarItem
                label="Quản lý Phòng Chiếu"
                active={activeTab === "rooms"}
                onClick={() => setActiveTab("rooms")}
              />
              <SidebarItem
                label="Quản lý Người dùng"
                active={activeTab === "users"}
                onClick={() => setActiveTab("users")}
              />
              <div className="my-4 border-t border-neutral-700"></div>
              <SidebarItem
                label="Thống kê Doanh thu"
                active={activeTab === "stats"}
                onClick={() => setActiveTab("stats")}
              />
            </nav>

            <div className="mt-auto pt-8 text-xs text-neutral-500">
              AnCinema Admin v1.0
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 bg-neutral-900 overflow-x-hidden">
          <div className="md:hidden mb-6">
            <select
              className="w-full bg-neutral-800 p-3 rounded text-white border border-neutral-700"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="movies">Quản lý Phim</option>
              <option value="showtimes">Quản lý Lịch chiếu</option>
              <option value="rooms">Quản lý Phòng</option>
              <option value="users">Quản lý Người dùng</option>
              <option value="stats">Thống kê Doanh thu</option>
            </select>
          </div>

          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
      active
        ? "bg-yellow-500 text-neutral-900 font-bold shadow-lg shadow-yellow-500/20"
        : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
    }`}
  >
    {label}
  </button>
);

export default AdminDashboard;
