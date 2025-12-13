import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomForm from "./RoomForm";
import SeatDesigner from "./SeatDesigner";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState("LIST");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const loadRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/rooms");
      setRooms(res.data.result || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleDeleteRoom = async (id, name) => {
    Swal.fire({
      title: `Xóa phòng ${name}?`,
      text: "Hành động này không thể hoàn tác! Toàn bộ ghế sẽ bị xóa.",
      icon: "warning",
      background: "#171717", 
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#404040",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8080/api/rooms/${id}`);
          
          Swal.fire({
            title: "Đã xóa!",
            text: "Phòng chiếu đã bị xóa.",
            icon: "success",
            background: "#171717",
            color: "#fff",
            confirmButtonColor: "#EAB308",
          });
          
          loadRooms(); 
        } catch (error) {
          toast.error("Lỗi: " + (error.response?.data?.message || "Lỗi server"));
        }
      }
    });
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setView("CREATE");
  };

  if (view === "CREATE") {
    return (
      <RoomForm
        roomData={selectedRoom}
        onBack={() => {
          setView("LIST");
          setSelectedRoom(null);
          loadRooms();
        }}
      />
    );
  }

  if (view === "DESIGN") {
    return (
      <SeatDesigner
        room={selectedRoom}
        onBack={() => {
          setView("LIST");
          setSelectedRoom(null);
        }}
      />
    );
  }

  return (
    <div className="p-8 text-white w-full"> {/* Thêm w-full để chiếm hết chiều rộng */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">Quản Lý Phòng Chiếu</h2>
        <button
          onClick={() => { setSelectedRoom(null); setView("CREATE"); }}
          className="bg-yellow-500 text-neutral-900 px-4 py-2 rounded font-bold hover:bg-yellow-400"
        >
          + Thêm Phòng Mới
        </button>
      </div>

      {/* GRID RESPONSIVE: Trên màn hình lớn (xl) sẽ chia 3 cột, màn hình vừa (md) chia 2 cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 hover:border-yellow-500 transition-colors flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold mb-2 truncate text-yellow-500" title={room.name}>
                {room.name}
              </h3>
              <p className="text-neutral-400 mb-4 text-sm">
                Rạp: {room.cinema?.name || "AnCinema Center"} <br />
                Kích thước: <span className="text-white font-bold">{room.totalRows} hàng x {room.totalCols} cột</span>
                <br/>
                Tổng ghế: {room.totalRows * room.totalCols}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditRoom(room)}
                className="px-3 py-2 bg-neutral-700 rounded hover:bg-neutral-600 text-xs font-bold"
              >
                ✏️ Sửa Tên
              </button>
              <button
                onClick={() => handleDeleteRoom(room.id, room.name)}
                className="px-3 py-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900 text-xs font-bold"
              >
                🗑 Xóa
              </button>
              <button
                onClick={() => {
                  setSelectedRoom(room);
                  setView("DESIGN");
                }}
                className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-500 font-bold text-xs"
              >
                ⚙️ Thiết kế ghế
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRooms;