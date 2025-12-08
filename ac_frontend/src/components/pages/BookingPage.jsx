import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const BookingPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt vé!");
      navigate("/login");
      return;
    }

    const fetchSeats = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/bookings/seats?showtimeId=${showtimeId}`
        );
        if (response.data.code === 1000 || response.data.result) {
          setSeats(response.data.result || []);
        }
      } catch (error) {
        console.error("Lỗi tải sơ đồ ghế:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showtimeId, navigate, user]);

  const seatsByRow = useMemo(() => {
    const rows = {};
    seats.forEach((seat) => {
      const rowLabel = seat.code.charAt(0); 
      if (!rows[rowLabel]) {
        rows[rowLabel] = [];
      }
      rows[rowLabel].push(seat);
    });
    
    Object.keys(rows).forEach(key => {
        rows[key].sort((a, b) => a.colIndex - b.colIndex);
    });

    return Object.keys(rows).sort().reduce((obj, key) => {
        obj[key] = rows[key];
        return obj;
    }, {});
  }, [seats]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + (seat ? seat.price : 0);
    }, 0);
  }, [selectedSeats, seats]);

  const handleSelectSeat = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id); 
      }
      return [...prev, seat.id]; 
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }
    
    const confirmMsg = `Xác nhận đặt ${selectedSeats.length} vé?\nTổng tiền: ${formatCurrency(totalPrice)}`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const payload = {
        userId: user.id,
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats,
      };
      
      const response = await axios.post("http://localhost:8080/api/bookings", payload);

      if (response.data.code === 1000 || response.data.result) {
        const bookingData = response.data.result;
        alert("Đặt vé thành công!");
        navigate(`/payment/${bookingData.id}`);
      } else {
        alert(response.data.message || "Đặt vé thất bại");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi kết nối Server";
      alert(`Lỗi: ${msg}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-yellow-500">Đang tải sơ đồ...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <div className="pt-24 pb-8 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-white">Chọn Ghế</h2>
        <p className="text-neutral-500 text-sm mt-2">Vui lòng chọn ghế ngồi mong muốn</p>
      </div>

      <div className="w-full flex flex-col items-center mb-12">
        <div className="w-2/3 h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full shadow-[0_10px_30px_rgba(234,179,8,0.3)]"></div>
        <span className="mt-4 text-neutral-500 text-sm uppercase tracking-widest">Màn hình</span>
      </div>

      <div className="flex-1 overflow-x-auto px-4 pb-32">
        <div className="min-w-[600px] flex flex-col items-center gap-3 mx-auto">
          {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-center gap-4">
              <span className="w-6 text-center text-neutral-500 font-bold">{rowLabel}</span>
              
              <div className="flex gap-2 sm:gap-3">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  const isVip = seat.type === "VIP";
                  const isCouple = seat.type === "COUPLE";
                  
                  let seatStyle = "bg-neutral-800 border-neutral-600 text-neutral-400 hover:border-yellow-500 hover:text-yellow-500 hover:shadow-[0_0_10px_rgba(234,179,8,0.4)]";
                  
                  if (seat.isBooked) {
                    seatStyle = "bg-neutral-800/50 border-neutral-800 text-neutral-700 cursor-not-allowed";
                  } else if (isSelected) {
                    seatStyle = "bg-yellow-500 border-yellow-500 text-neutral-900 font-bold shadow-[0_0_15px_rgba(234,179,8,0.6)] transform scale-110";
                  } else if (isVip) {
                    seatStyle = "border-red-500 text-red-500 hover:bg-red-500/10";
                  } else if (isCouple) {
                    seatStyle = "border-pink-500 text-pink-500 w-20 sm:w-24 rounded-lg hover:bg-pink-500/10"; 
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSelectSeat(seat)}
                      disabled={seat.isBooked}
                      className={`
                        relative h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-xs sm:text-sm transition-all duration-200 border rounded-t-lg rounded-b-md
                        ${seatStyle}
                        ${isCouple ? "w-20 sm:w-24" : ""}
                      `}
                      title={`${seat.code} - ${formatCurrency(seat.price)}`}
                    >
                      {seat.isBooked ? "X" : seat.code.substring(1)} 
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-neutral-400 mb-24 px-4 flex-wrap">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neutral-800 border border-neutral-600 rounded"></div> Thường</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 border border-red-500 rounded"></div> VIP</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 border border-pink-500 rounded w-8"></div> Couple</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded"></div> Đang chọn</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neutral-800 border-neutral-800 text-neutral-700 flex justify-center items-center">X</div> Đã đặt</div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-800 p-4 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-neutral-400 text-sm">Tổng cộng</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-500">{formatCurrency(totalPrice)}</span>
              <span className="text-sm text-neutral-500">({selectedSeats.length} ghế)</span>
            </div>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`
              px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-all
              ${selectedSeats.length > 0 
                ? "bg-yellow-500 text-neutral-900 hover:bg-yellow-400 hover:translate-y-[-2px]" 
                : "bg-neutral-800 text-neutral-600 cursor-not-allowed"}
            `}
          >
            Đặt Vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;