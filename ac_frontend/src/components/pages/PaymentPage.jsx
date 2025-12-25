import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Clock, QrCode, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [booking, setBooking] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  useEffect(() => {
      const fetchBookingDetail = async () => {
          try {
              const res = await axiosClient.get(`/bookings/${bookingId}`); 
              if (res.data.result) {
                  const data = res.data.result;
                  setBooking(data);
                  const bookingTime = new Date(data.bookingTime).getTime();
                  const diff = Math.floor((new Date().getTime() - bookingTime) / 1000); 
                  setTimeLeft(Math.max(0, 600 - diff));
              }
          } catch (error) {
              toast.error("Không tìm thấy thông tin vé!");
              navigate("/");
          } finally {
              setPageLoading(false);
          }
      };
      fetchBookingDetail();
  }, [bookingId, navigate]);

  useEffect(() => {
      if (timeLeft <= 0) {
          if (booking && !loading) {
             handleCancelBooking(true);
          }
          return;
      }
      timerRef.current = setInterval(() => setTimeLeft((p) => p - 1), 1000);
      return () => clearInterval(timerRef.current);
  }, [timeLeft, booking]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleCancelBooking = async (isAuto = false) => {
    try {
      if (!isAuto) setLoading(true);
      await axiosClient.post(`/bookings/cancel/${bookingId}`);
      if (!isAuto) toast.info("Đã hủy giữ ghế.");
      navigate(booking?.showtime ? `/booking/${booking.showtime.id}` : "/");
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleVNPayPayment = async () => {
    setLoading(true);
    try {
        const res = await axiosClient.post(`/bookings/payment/vnpay/${bookingId}`);
        if (res.data.result) {
            window.location.href = res.data.result;
        }
    } catch (error) {
        toast.error("Lỗi VNPay: " + (error.response?.data?.message || "Server Error"));
        setLoading(false);
    }
  };

  const handleManualPayment = () => {
     Swal.fire({
      title: "Xác nhận đã chuyển khoản?",
      text: "Hệ thống sẽ kiểm tra giao dịch của bạn.",
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#16A34A",
      confirmButtonText: "Đã chuyển tiền"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await axiosClient.post(`/bookings/${bookingId}/pay`);
          Swal.fire({
              title: "Thành công!", text: "Vé đã được gửi mail.", icon: "success",
              background: "#171717", color: "#fff", confirmButtonColor: "#EAB308"
          }).then(() => navigate("/"));
        } catch (error) {
          toast.error("Lỗi: " + error.response?.data?.message);
        } finally { setLoading(false); }
      }
    });
  };

  if (pageLoading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div></div>;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-900 text-white px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => handleCancelBooking()} className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-yellow-500 transition-colors">
            <ArrowLeft size={20} /> Hủy & Quay lại
        </button>

        <div className="bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border border-neutral-700 grid md:grid-cols-3">
            <div className="md:col-span-1 bg-neutral-800 border-r border-neutral-700 p-6 flex flex-col items-center text-center">
                 <img src={booking?.showtime?.movie?.posterUrl} alt="Poster" className="w-40 rounded-lg shadow-lg mb-4 border border-neutral-600"/>
                 <h3 className="text-xl font-bold text-yellow-500 uppercase">{booking?.showtime?.movie?.title}</h3>
                 <p className="text-neutral-300 font-bold mt-2">{booking?.showtime?.room?.name}</p>
                 <div className="mt-6 w-full border-t border-neutral-700 pt-4 text-left space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-neutral-500">Suất chiếu:</span><span className="font-bold">{booking?.showtime?.startTime && new Date(booking.showtime.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Ngày:</span><span className="font-bold">{booking?.showtime?.startTime && new Date(booking.showtime.startTime).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Ghế:</span><span className="font-bold text-yellow-500 text-right">{booking?.bookingDetails?.map(d => d.seat.seatCode).join(", ")}</span></div>
                 </div>
            </div>

            <div className="md:col-span-2 p-8 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wide">Thanh Toán</h2>
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded border border-red-500/20">
                        <Clock size={18} /> <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-neutral-900/50 rounded border border-neutral-700 text-center">
                    <p className="text-neutral-400 text-sm mb-1">Tổng tiền thanh toán</p>
                    <div className="text-3xl font-bold text-yellow-500">{booking?.totalPrice?.toLocaleString()} VND</div>
                </div>

                <div className="space-y-4">
                    <div onClick={handleVNPayPayment} className="p-4 rounded-lg border border-neutral-600 bg-neutral-700/30 hover:bg-blue-900/20 hover:border-blue-500 transition-all cursor-pointer group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-1 rounded h-12 w-12 flex items-center justify-center"><img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" className="w-full object-contain" alt="VNPay"/></div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Thanh toán qua VNPay</h4>
                                <p className="text-xs text-neutral-400">Hỗ trợ thẻ ATM, Visa, MasterCard, QR Code</p>
                            </div>
                        </div>
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500"></div> : <CreditCard className="text-neutral-500 group-hover:text-blue-400"/>}
                    </div>

                    <div className="p-4 rounded-lg border border-neutral-600 bg-neutral-700/30">
                        <div className="flex gap-4">
                             <div className="bg-white p-1 rounded h-24 w-24 shrink-0">
                                <img src={`https://img.vietqr.io/image/MB-0000000000-compact2.png?amount=${booking?.totalPrice}&addInfo=Ve ${bookingId}`} alt="QR" className="w-full h-full object-contain"/>
                             </div>
                             <div className="flex-1">
                                <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-1"><QrCode size={16} className="text-yellow-500"/> Chuyển khoản thủ công</h4>
                                <p className="text-xs text-neutral-400 mb-3">Quét mã và bấm nút bên dưới nếu VNPay lỗi.</p>
                                <button onClick={handleManualPayment} disabled={loading} className="w-full py-2 bg-neutral-600 hover:bg-green-600 text-white rounded font-bold text-xs uppercase transition-colors">
                                    {loading ? "Đang xử lý..." : "Tôi đã chuyển tiền"}
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 flex gap-2 items-center justify-center text-xs text-neutral-500">
                    <ShieldCheck size={14} /> Thanh toán bảo mật và mã hóa bởi VNPay
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentPage;