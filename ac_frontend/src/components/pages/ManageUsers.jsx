import React, { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { format } from "date-fns";
import {
  Users,
  Search,
  Mail,
  Shield,
  Clock,
  Lock,
  Unlock,
  History,
  X,
  MapPin,
  Calendar,
  ShieldAlert,
} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/users");
      setUsers(res.data.result || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    const lower = debouncedSearchTerm.toLowerCase();
    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || "").includes(lower) ||
        (u.email?.toLowerCase() || "").includes(lower)
    );
  }, [users, debouncedSearchTerm]);

  const handleToggleStatus = (id, currentStatus, name) => {
    const actionText = currentStatus ? "Khóa" : "Mở khóa";
    Swal.fire({
      title: `${actionText} user này?`,
      text: `Tài khoản: ${name}`,
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#d33" : "#10B981",
      confirmButtonText: `Vâng, ${actionText}!`,
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axiosClient.put(`/admin/users/${id}/status`);
          toast.success(`Đã ${actionText} thành công!`);
          loadData();
        } catch (err) {
          toast.error("Lỗi cập nhật trạng thái");
        }
      }
    });
  };

  const handleChangeRole = (user) => {
    const isCurrentlyAdmin = user.role === "admin";
    const newRole = isCurrentlyAdmin ? "customer" : "admin";
    const roleText = isCurrentlyAdmin
      ? "Xuống làm Khách hàng"
      : "Lên làm Admin";

    Swal.fire({
      title: `Thay đổi quyền hạn?`,
      text: `Bạn muốn chuyển ${user.name} ${roleText}?`,
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#EAB308",
      confirmButtonText: "Đồng ý",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axiosClient.put(`/admin/users/${user.id}/role`, null, {
            params: { role: newRole },
          });
          toast.success("Cập nhật quyền thành công!");
          loadData();
        } catch (err) {
          toast.error("Lỗi cập nhật quyền");
        }
      }
    });
  };

  const handleViewHistory = async (user) => {
    setSelectedUserHistory(user);
    setLoadingHistory(true);
    setHistoryList([]);

    try {
      const res = await axiosClient.get(`/admin/users/${user.id}/bookings`);
      setHistoryList(res.data.result || []);
    } catch (error) {
      toast.error("Không thể tải lịch sử vé");
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  if (loading)
    return (
      <div className="text-center p-10 text-white">Đang tải dữ liệu...</div>
    );

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
          <Users /> Quản Lý Người Dùng
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:border-yellow-500 block w-64 pl-10 p-2.5 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`relative bg-neutral-800 p-6 rounded-lg border transition-all hover:-translate-y-1 shadow-lg group ${
              user.isActive === false
                ? "border-red-900/50 opacity-75"
                : "border-neutral-700 hover:border-yellow-500/50"
            }`}
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    user.role === "admin"
                      ? "bg-yellow-500 text-neutral-900"
                      : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-white text-lg truncate"
                    title={user.name}
                  >
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider">
                    {user.role === "admin" ? (
                      <span className="text-yellow-500 flex items-center gap-1">
                        <Shield size={10} /> Admin
                      </span>
                    ) : (
                      <span className="text-neutral-500">Khách hàng</span>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold border ${
                  user.isActive !== false
                    ? "bg-green-900/20 border-green-800 text-green-500"
                    : "bg-red-900/20 border-red-800 text-red-500"
                }`}
              >
                {user.isActive !== false ? "Active" : "Locked"}
              </div>
            </div>

            <div className="space-y-3 text-sm text-neutral-300 mb-14">
              <div className="flex items-center gap-3 overflow-hidden">
                <Mail size={16} className="text-neutral-500 min-w-[16px]" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-neutral-500 min-w-[16px]" />
                <span>
                  Đăng ký:{" "}
                  {user.createdAt
                    ? format(new Date(user.createdAt), "dd/MM/yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleViewHistory(user)}
                className="p-2 bg-neutral-700 text-neutral-300 rounded-full hover:bg-blue-600 hover:text-white transition-colors shadow-lg"
                title="Xem lịch sử đặt vé"
              >
                <History size={18} />
              </button>

              <button
                onClick={() => handleChangeRole(user)}
                className="p-2 bg-neutral-700 text-neutral-300 rounded-full hover:bg-yellow-500 hover:text-black transition-colors shadow-lg"
                title="Thay đổi quyền hạn (Admin/User)"
              >
                <ShieldAlert size={18} />
              </button>

              {user.role !== "admin" && (
                <button
                  onClick={() =>
                    handleToggleStatus(
                      user.id,
                      user.isActive !== false,
                      user.name
                    )
                  }
                  className={`p-2 rounded-full transition-colors shadow-lg ${
                    user.isActive !== false
                      ? "bg-neutral-700 text-neutral-300 hover:bg-red-600 hover:text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-green-600 hover:text-white"
                  }`}
                  title={user.isActive !== false ? "Khóa tài khoản" : "Mở khóa"}
                >
                  {user.isActive !== false ? (
                    <Lock size={18} />
                  ) : (
                    <Unlock size={18} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedUserHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-neutral-800 w-full max-w-4xl rounded-xl border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-neutral-700 flex justify-between items-center bg-neutral-900">
              <h3 className="font-bold text-lg text-yellow-500 flex items-center gap-2">
                <History size={20} /> Lịch sử vé:{" "}
                <span className="text-white">{selectedUserHistory.name}</span>
              </h3>
              <button
                onClick={() => setSelectedUserHistory(null)}
                className="p-2 hover:bg-neutral-700 rounded-full text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {loadingHistory ? (
                <div className="text-center py-10 text-neutral-500">
                  Đang tải lịch sử...
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 border border-dashed border-neutral-700 rounded-lg">
                  User này chưa đặt vé nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyList.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-neutral-900 p-4 rounded-lg border border-neutral-700 flex flex-col md:flex-row gap-4 items-center"
                    >
                      <img
                        src={
                          booking.showtime?.movie?.posterUrl ||
                          "/placeholder.jpg"
                        }
                        className="w-16 h-24 object-cover rounded border border-neutral-600"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-lg truncate">
                          {booking.showtime?.movie?.title}
                        </h4>
                        <div className="text-sm text-neutral-400 space-y-1 mt-1">
                          <p className="flex items-center gap-2">
                            <MapPin size={14} /> {booking.showtime?.room?.name}
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar size={14} />{" "}
                            {format(
                              new Date(booking.bookingTime),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <div
                          className={`text-xs font-bold uppercase mb-2 px-2 py-1 rounded inline-block ${
                            booking.status === "paid"
                              ? "bg-green-900 text-green-500"
                              : "bg-red-900 text-red-500"
                          }`}
                        >
                          {booking.status}
                        </div>
                        <p className="font-bold text-xl text-yellow-500">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
