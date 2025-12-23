import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { format } from "date-fns";
import { Eye, MapPin, Calendar, X } from "lucide-react";

const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosClient.get(`/bookings/my-bookings?userId=${user.id}`);
        setBookings(res.data.result || res.data || []);
      } catch (error) {
        console.error("Lỗi fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  const formatCurrency = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  if (loading) return <p className="text-neutral-400">Đang tải dữ liệu...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase tracking-wider border-b border-neutral-700 pb-4">
        Lịch sử đặt vé
      </h2>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 italic">Chưa có giao dịch nào.</div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 hover:border-yellow-500 transition-all group">
              <img 
                src={booking.showtime?.movie?.posterUrl || "/placeholder.jpg"} 
                alt="Poster"
                className="w-24 h-36 object-cover rounded shadow-md border border-neutral-800"
                onError={(e) => e.target.src = "https://via.placeholder.com/150x200?text=No+Image"}
              />
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">
                      {booking.showtime?.movie?.title || "Tên phim"}
                   </h3>
                   <div className="text-sm text-neutral-400 space-y-1">
                      <p className="flex items-center gap-2">
                        <MapPin size={14}/> {booking.showtime?.room?.cinema?.name || "Rạp"} - {booking.showtime?.room?.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14}/> Ngày đặt: {format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm")}
                      </p>
                      <p className="font-bold text-white mt-2">Tổng tiền: {formatCurrency(booking.totalPrice)}</p>
                   </div>
                </div>
                
                <div className="mt-4 flex justify-between items-end">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${booking.status === 'paid' ? 'bg-green-900/30 text-green-500 border border-green-800' : 'bg-red-900/30 text-red-500 border border-red-800'}`}>
                        {booking.status === 'paid' ? "Đã thanh toán" : "Chờ thanh toán"}
                    </span>
                    <button 
                        onClick={() => setSelectedTicket(booking)}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Eye size={16}/> Xem chi tiết
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-[#Fdfbf7] text-neutral-900 w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden relative">
                
                <button 
                    onClick={() => setSelectedTicket(null)}
                    className="absolute top-2 right-2 p-2 bg-neutral-200 hover:bg-neutral-300 rounded-full z-10"
                >
                    <X size={20}/>
                </button>

                <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg uppercase">Thông Tin Giao Dịch</h3>
                    <div className="bg-red-700 px-3 py-1 rounded text-sm font-bold cursor-pointer hover:bg-red-800">In vé</div>
                </div>

                <div className="p-8">
                    <div className="mb-6 text-sm text-neutral-600 uppercase font-bold">
                        Ngày đặt vé: {format(new Date(selectedTicket.bookingTime), "dd 'tháng' MM 'năm' yyyy")}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-neutral-800">Người đặt vé</h4>
                            <p className="font-bold text-neutral-700">{user.name}</p>
                            <p className="text-neutral-500 text-sm">{user.email}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-neutral-800">Thanh toán</h4>
                            <p className="text-neutral-600 uppercase font-medium">
                                {selectedTicket.paymentMethod || "MOMO / VNPAY / TIỀN MẶT"}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">Mã GD: #{selectedTicket.id}</p>
                        </div>
                    </div>

                    <div className="bg-neutral-800 text-white font-bold p-3 uppercase text-sm tracking-wide text-center">
                        Chi Tiết Vé
                    </div>

                    <div className="border border-neutral-300">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-100 border-b border-neutral-300 text-neutral-600">
                                <tr>
                                    <th className="p-3">Phim</th>
                                    <th className="p-3">Suất chiếu</th>
                                    <th className="p-3 text-right">Ghế</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 align-top font-bold text-neutral-800 w-1/3">
                                        {selectedTicket.showtime?.movie?.title}
                                    </td>
                                    <td className="p-3 align-top">
                                        <p className="font-bold">{selectedTicket.showtime?.room?.cinema?.name}</p>
                                        <p>{selectedTicket.showtime?.room?.name}</p>
                                        <p>{format(new Date(selectedTicket.showtime?.startTime), "HH:mm - dd/MM/yyyy")}</p>
                                    </td>
                                    <td className="p-3 align-top text-right">
                                        <p className="font-bold text-red-600 text-lg">
                                            {selectedTicket.tickets?.map(t => t.seat?.name).join(", ") || "Ghế thường"}
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200">
                         <span className="text-neutral-500 text-sm italic">Cảm ơn bạn đã sử dụng dịch vụ!</span>
                         <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-neutral-800">Tổng Cộng:</span>
                            <span className="font-bold text-2xl text-red-600">{formatCurrency(selectedTicket.totalPrice)}</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;