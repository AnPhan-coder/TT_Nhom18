import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BookingSeatIcon = ({ seat, isSelected, onSelect }) => {
  const isBooked = seat.booked;
  const type = seat.type || "NORMAL";
  const code = seat.code || "";
  const label = code.length > 1 ? code.substring(1) : code;

  let fillColor = "#525252";
  let strokeColor = "none";
  let cursorStyle = "cursor-pointer hover:brightness-110";

  if (isBooked) {
    fillColor = "#404040";
    cursorStyle = "cursor-not-allowed opacity-50";
  } else if (isSelected) {
    fillColor = "#EAB308";
    strokeColor = "#FACC15";
  } else {
    if (type === "VIP") fillColor = "#DC2626";
    if (type === "COUPLE") fillColor = "#DB2777";
  }

  const handleClick = () => {
    if (!isBooked) onSelect(seat);
  };

  if (type === "COUPLE") {
    return (
      <div
        onClick={handleClick}
        className={`relative w-20 h-9 sm:w-24 sm:h-10 flex justify-center items-end group transition-all transform ${cursorStyle} ${
          isSelected
            ? "scale-105 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
            : ""
        }`}
        title={`${code} - ${isBooked ? "Đã bán" : formatCurrency(seat.price)}`}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 45"
          fill="none"
          className="transition-all"
        >
          <path
            d="M10 10 C 10 0, 90 0, 90 10 L 90 35 L 10 35 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={isSelected ? 2 : 0}
          />
          <rect
            x="0"
            y="15"
            width="8"
            height="30"
            rx="4"
            fill={fillColor}
            className="brightness-110"
          />
          <rect
            x="92"
            y="15"
            width="8"
            height="30"
            rx="4"
            fill={fillColor}
            className="brightness-110"
          />
          <rect
            x="8"
            y="30"
            width="84"
            height="12"
            rx="2"
            fill={fillColor}
            className="brightness-90"
          />
          {isBooked && (
            <path
              d="M40 15 L60 35 M60 15 L40 35"
              stroke="#737373"
              strokeWidth="3"
            />
          )}
        </svg>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold select-none pointer-events-none mix-blend-difference">
          {isBooked ? "" : label}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 flex justify-center items-end group transition-all transform ${cursorStyle} ${
        isSelected ? "scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : ""
      }`}
      title={`${code} - ${isBooked ? "Đã bán" : formatCurrency(seat.price)}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 40 40"
        fill="none"
        className="transition-all"
      >
        <path
          d="M5 10 C 5 0, 35 0, 35 10 L 35 30 L 5 30 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? 2 : 0}
        />
        <rect
          x="0"
          y="15"
          width="6"
          height="22"
          rx="2"
          fill={fillColor}
          className="brightness-110"
        />
        <rect
          x="34"
          y="15"
          width="6"
          height="22"
          rx="2"
          fill={fillColor}
          className="brightness-110"
        />
        <rect
          x="5"
          y="26"
          width="30"
          height="10"
          rx="2"
          fill={fillColor}
          className="brightness-90"
        />
        {isBooked && (
          <path
            d="M12 12 L28 28 M28 12 L12 28"
            stroke="#737373"
            strokeWidth="3"
          />
        )}
      </svg>
      <span className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-[10px] font-bold select-none pointer-events-none mix-blend-difference">
        {isBooked ? "" : label}
      </span>
    </div>
  );
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

  const fetchSeats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/bookings/seats?showtimeId=${showtimeId}`
      );
      if (response.data.code === 1000 || response.data.result) {
        const rawSeats = response.data.result || [];
        const activeSeats = rawSeats.filter((s) => s.active !== false);
        setSeats(activeSeats);
      }
    } catch (error) {
      toast.error("Lỗi tải sơ đồ ghế: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.warning("🔒 Vui lòng đăng nhập để đặt vé!");
      navigate("/login");
      return;
    }
    fetchSeats();
  }, [showtimeId, navigate, user]);

  const seatsByRow = useMemo(() => {
    const rows = {};
    seats.forEach((seat) => {
      const rowLabel = seat.code.charAt(0);
      if (!rows[rowLabel]) rows[rowLabel] = [];
      rows[rowLabel].push(seat);
    });
    Object.keys(rows).forEach((key) => {
      rows[key].sort((a, b) => a.colIndex - b.colIndex);
    });
    return Object.keys(rows)
      .sort()
      .reduce((obj, key) => {
        obj[key] = rows[key];
        return obj;
      }, {});
  }, [seats]);

  const roomTypes = useMemo(() => {
    return {
      hasVip: seats.some((s) => (s.type || "") === "VIP"),
      hasCouple: seats.some((s) => (s.type || "") === "COUPLE"),
    };
  }, [seats]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat ? seat.price : 0);
    }, 0);
  }, [selectedSeats, seats]);

  const handleSelectSeat = (seat) => {
    if (seat.isBooked || seat.booked) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      return [...prev, seat.id];
    });
  };

  const checkOrphanSeats = (selectedIds) => {
    const simulatedSeats = seats.map((s) => ({
      ...s,
      isOccupied: s.isBooked || s.booked || selectedIds.includes(s.id),
      normalizedType: s.type || "NORMAL",
    }));

    const rows = {};
    simulatedSeats.forEach((s) => {
      const rowKey = s.code.charAt(0);
      if (!rows[rowKey]) rows[rowKey] = [];
      rows[rowKey].push(s);
    });

    for (const [rowLabel, rowSeats] of Object.entries(rows)) {
      rowSeats.sort((a, b) => a.colIndex - b.colIndex);
      let emptyCount = 0;

      for (let i = 0; i < rowSeats.length; i++) {
        const seat = rowSeats[i];

        if (i > 0) {
          const prevSeat = rowSeats[i - 1];
          const prevSeatWidth = prevSeat.normalizedType === "COUPLE" ? 2 : 1;

          if (seat.colIndex > prevSeat.colIndex + prevSeatWidth) {
            if (emptyCount === 1) return { error: true, row: rowLabel };
            emptyCount = 0;
          }
        }

        if (!seat.isOccupied) {
          emptyCount += seat.normalizedType === "COUPLE" ? 2 : 1;
        } else {
          if (emptyCount === 1) return { error: true, row: rowLabel };
          emptyCount = 0;
        }
      }
      if (emptyCount === 1) return { error: true, row: rowLabel };
    }
    return { error: false };
  };
const aisleConfig = useMemo(() => {
      if (seats.length === 0) return [];

      // Tìm colIndex lớn nhất để biết độ rộng phòng
      const maxCol = Math.max(...seats.map((s) => s.colIndex));

      const centerBlock = 8;
      if (maxCol <= centerBlock) return [];

      const sideBlock = Math.floor((maxCol - centerBlock) / 2);

      // Trả về danh sách cột cần thêm khoảng cách
      return [sideBlock, sideBlock + centerBlock];
    }, [seats]);
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.warning("⚠️ Vui lòng chọn ít nhất 1 ghế!");
      return;
    }

    const validation = checkOrphanSeats(selectedSeats);
    if (validation.error) {
      toast.error(
        `⛔ Không được để chừa 1 ghế trống tại hàng ${validation.row}!`
      );
      return;
    }
    
    Swal.fire({
      title: "Xác nhận đặt vé?",
      html: `
            <div style="text-align: left; font-size: 0.9em;">
                <p>Số lượng: <b>${selectedSeats.length} vé</b></p>
                <p>Tổng tiền: <b style="color: #EAB308; font-size: 1.2em;">${formatCurrency(
                  totalPrice
                )}</b></p>
            </div>
        `,
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#EAB308",
      cancelButtonColor: "#404040",
      confirmButtonText: "Thanh toán ngay",
      cancelButtonText: "Chọn lại",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            userId: user.id,
            showtimeId: Number(showtimeId),
            seatIds: selectedSeats,
          };
          const response = await axios.post(
            "http://localhost:8080/api/bookings",
            payload
          );

          if (response.data.code === 1000 || response.data.result) {
            const bookingData = response.data.result;
            toast.success("Đặt vé thành công!");
            setSelectedSeats([]);
            await fetchSeats();
            navigate(`/payment/${bookingData.id}`);
          } else {
            toast.error(response.data.message || "Đặt vé thất bại");
          }
        } catch (error) {
          const msg = error.response?.data?.message || "Lỗi kết nối Server";
          toast.error(`Lỗi: ${msg}`);
        }
      }
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-yellow-500">
        Đang tải sơ đồ...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <div className="pt-24 pb-8 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-white">
          Chọn Ghế
        </h2>
        <p className="text-neutral-500 text-sm mt-2">
          Vui lòng chọn ghế ngồi mong muốn
        </p>
      </div>

      <div className="w-full flex flex-col items-center mb-12">
        <div className="w-2/3 h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full shadow-[0_10px_30px_rgba(234,179,8,0.3)]"></div>
        <span className="mt-4 text-neutral-500 text-sm uppercase tracking-widest">
          Màn hình
        </span>
      </div>

      <div className="flex-1 overflow-x-auto px-4 pb-32">
        <div className="min-w-[600px] flex flex-col items-center gap-2 mx-auto">
          {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-end gap-4">
              <span className="w-6 text-center text-neutral-500 font-bold mb-2">
                {rowLabel}
              </span>
              <div className="flex items-end">
                {rowSeats.map((seat) => {
                  const prevSeat = rowSeats.find(
                    (s) => s.colIndex === seat.colIndex - 1
                  );
                  if (prevSeat && (prevSeat.type || "") === "COUPLE") {
                    return null;
                  }

                  // --- LOGIC LỐI ĐI ---
                  const isAisle = aisleConfig.includes(seat.colIndex);
                  // --------------------

                  return (
                    <div
                      key={seat.id}
                      className={`mx-1 ${isAisle ? "mr-10 sm:mr-14" : ""}`}
                    >
                      <BookingSeatIcon
                        seat={seat}
                        isSelected={selectedSeats.includes(seat.id)}
                        onSelect={handleSelectSeat}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-6 text-xs sm:text-sm text-neutral-400 mb-24 px-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex justify-center items-center">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <path
                d="M5 10 C 5 0, 35 0, 35 10 L 35 30 L 5 30 Z"
                fill="#525252"
              />
            </svg>
          </div>{" "}
          Thường
        </div>
        {roomTypes.hasVip && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex justify-center items-center">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <path
                  d="M5 10 C 5 0, 35 0, 35 10 L 35 30 L 5 30 Z"
                  fill="#DC2626"
                />
              </svg>
            </div>{" "}
            VIP
          </div>
        )}
        {roomTypes.hasCouple && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 flex justify-center items-center">
              <svg viewBox="0 0 100 45" className="w-full h-full">
                <path
                  d="M10 10 C 10 0, 90 0, 90 10 L 90 35 L 10 35 Z"
                  fill="#DB2777"
                />
              </svg>
            </div>{" "}
            Couple
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex justify-center items-center">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <path
                d="M5 10 C 5 0, 35 0, 35 10 L 35 30 L 5 30 Z"
                fill="#EAB308"
                stroke="#FACC15"
                strokeWidth="2"
              />
            </svg>
          </div>{" "}
          Đang chọn
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex justify-center items-center opacity-50">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <path
                d="M5 10 C 5 0, 35 0, 35 10 L 35 30 L 5 30 Z"
                fill="#404040"
              />
              <path
                d="M12 12 L28 28 M28 12 L12 28"
                stroke="#737373"
                strokeWidth="3"
              />
            </svg>
          </div>{" "}
          Đã đặt
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-800 p-4 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-neutral-400 text-sm">Tổng cộng</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-500">
                {formatCurrency(totalPrice)}
              </span>
              <span className="text-sm text-neutral-500">
                ({selectedSeats.length} ghế)
              </span>
            </div>
          </div>
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
              selectedSeats.length > 0
                ? "bg-yellow-500 text-neutral-900 hover:bg-yellow-400"
                : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
            }`}
          >
            Đặt Vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
