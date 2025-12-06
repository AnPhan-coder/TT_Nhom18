import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleConfirmPayment = async () => {
    if (!window.confirm("Bạn xác nhận đã chuyển khoản theo đúng nội dung?")) return;
    
    setLoading(true);
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/pay`);
      
      if (response.data.code === 1000 || response.data.result) {
        alert("✅ Thanh toán thành công! Cảm ơn bạn.");
        navigate("/"); 
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể xác nhận thanh toán"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-neutral-900 text-white px-4">
      <div className="max-w-3xl mx-auto bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border border-neutral-700">
        
        <div className="bg-yellow-500 p-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 uppercase">Cổng Thanh Toán</h2>
          <p className="text-neutral-800">Mã đơn hàng: #{bookingId}</p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">Cách 1: Chuyển khoản QR</h3>
            <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                <img 
                    src={`https://img.vietqr.io/image/MB-0000000000-compact2.png?amount=0&addInfo=Thanh toan ve ${bookingId}`} 
                    alt="QR Payment" 
                    className="w-48 h-48 object-contain"
                />
            </div>
            <p className="text-sm text-neutral-400 mt-4">
              Mở App ngân hàng quét mã trên để thanh toán nhanh.
            </p>
          </div>

          {/* Cột phải: Hướng dẫn & Nút bấm */}
          <div className="flex flex-col justify-center space-y-6">
             <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2">Lưu ý quan trọng</h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 text-sm">
                    <li>Vé sẽ được giữ trong vòng <strong>10 phút</strong>.</li>
                    <li>Vui lòng không tắt trình duyệt khi đang thanh toán.</li>
                    <li>Sau khi chuyển khoản, bấm nút xác nhận bên dưới.</li>
                </ul>
             </div>

             <button 
                onClick={handleConfirmPayment}
                disabled={loading}
                className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all
                  ${loading ? "bg-neutral-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/30"}
                `}
             >
                {loading ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
             </button>
             
             <button 
                onClick={() => navigate("/")}
                className="w-full py-3 text-neutral-500 hover:text-white transition-colors"
             >
                Hủy giao dịch
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;