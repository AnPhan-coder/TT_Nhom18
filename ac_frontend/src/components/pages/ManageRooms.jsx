import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomForm from "./RoomForm";
import SeatDesigner from "./SeatDesigner";

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
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa phòng: ${name}? \n(Cảnh báo: Tất cả ghế và lịch chiếu liên quan sẽ bị xóa!)`
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:8080/api/rooms/${id}`);
      alert("Đã xóa phòng!");
      loadRooms(); // Tải lại danh sách
    } catch (error) {
      alert(
        "Lỗi xóa phòng: " + (error.response?.data?.message || "Lỗi server")
      );
    }
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
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">
          Quản Lý Phòng Chiếu
        </h2>
        <button
          onClick={() => setView("CREATE")}
          className="bg-yellow-500 text-neutral-900 px-4 py-2 rounded font-bold"
        >
          + Thêm Phòng Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 hover:border-yellow-500 transition-colors flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold mb-2 truncate" title={room.name}>
                {room.name}
              </h3>
              <p className="text-neutral-400 mb-4 text-sm">
                {room.cinema?.name || "Rạp mặc định"} <br />
                Kích thước:{" "}
                <span className="text-white font-bold">
                  {room.totalRows}x{room.totalCols}
                </span>
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditRoom(room)}
                className="px-3 py-2 bg-neutral-700 rounded hover:bg-neutral-600 text-sm"
              >
                ✏️ Sửa Tên
              </button>
              <button
                onClick={() => handleDeleteRoom(room.id, room.name)}
                className="px-3 py-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900 text-sm"
              >
                🗑 Xóa
              </button>
              <button
                onClick={() => {
                  setSelectedRoom(room);
                  setView("DESIGN");
                }}
                className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-500 font-bold text-sm"
              >
                ⚙️ Sơ đồ ghế
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRooms;
