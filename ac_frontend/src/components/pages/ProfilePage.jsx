import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient"; 
import { useNavigate } from "react-router-dom";
import { Ticket, User, Calendar, Clock, MapPin } from "lucide-react"; 

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchMyBookings = async () => {
      try {
        const response = await axiosClient.get(`/bookings/my-bookings?userId=${parsedUser.id}`);
        if (response.data.code === 1000 || response.data.result) {
          setBookings(response.data.result || []);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử vé:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [navigate]);

  const formatCurrency = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");

  if (!user) return null;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-neutral-900 text-white px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-6 mb-10 bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-lg">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-neutral-900 uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <div className="flex items-center gap-2 text-neutral-400 mt-1">
                <User size={16} />
                <span>{user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng thân thiết"}</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-yellow-500 mb-6 uppercase tracking-wider flex items-center gap-2">
            <Ticket /> Vé đã đặt
        </h2>

        <div className="space-y-4">
            {loading ? (
                <p className="text-neutral-500">Đang tải dữ liệu...</p>
            ) : bookings.length === 0 ? (
                <div className="text-center py-10 bg-neutral-800 rounded-lg border border-dashed border-neutral-700">
                    <p className="text-neutral-400">Bạn chưa đặt vé nào.</p>
                    <button onClick={() => navigate("/")} className="mt-4 text-yellow-500 hover:underline">Đặt vé ngay &rarr;</button>
                </div>
            ) : (
                bookings.map((booking) => (
                    <div key={booking.id} className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 hover:border-yellow-500 transition-all flex flex-col md:flex-row justify-between gap-6">
                        
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                {booking.showtime?.movie?.title || "Tên phim đang cập nhật"}
                            </h3>
                            <div className="text-sm text-neutral-400 space-y-1">
                                <p className="flex items-center gap-2"><MapPin size={14}/> {booking.showtime?.room?.name} - {booking.showtime?.room?.cinema?.name}</p>
                                <p className="flex items-center gap-2"><Clock size={14}/> Suất chiếu: <span className="text-yellow-500">{formatDate(booking.showtime?.startTime)}</span></p>
                                <p className="flex items-center gap-2"><Calendar size={14}/> Ngày đặt: {formatDate(booking.bookingTime)}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end justify-between min-w-[140px]">
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider 
                                ${booking.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'}`}>
                                {booking.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </span>

                            <div className="text-right mt-4">
                                <p className="text-2xl font-bold text-white">{formatCurrency(booking.totalPrice)}</p>
                                {booking.status !== 'paid' && (
                                    <button 
                                        onClick={() => navigate(`/payment/${booking.id}`)}
                                        className="mt-2 text-sm bg-yellow-500 text-neutral-900 px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors"
                                    >
                                        Thanh toán
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;