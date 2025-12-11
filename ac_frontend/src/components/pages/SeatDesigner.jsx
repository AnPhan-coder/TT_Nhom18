import React, { useEffect, useState } from "react";
import axios from "axios";

const SeatDesigner = ({ room, onBack }) => { // Nhận cả object room
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState("VIP"); 

  useEffect(() => {
    if(room) loadSeats();
  }, [room]);

  const loadSeats = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/seats?roomId=${room.id}`);
      setSeats(res.data.result || []);
    } catch (error) {
      console.error("Lỗi tải ghế:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ CLICK ---
  const handleCellClick = async (r, c, existingSeat) => {
    // 1. TOOL XÓA: Nếu có ghế -> Xóa đi
    if (selectedTool === "DELETE") {
        if (!existingSeat) return; // Đã là ô trống rồi thì thôi
        if (!window.confirm(`Xóa ghế ${existingSeat.seatCode}?`)) return;

        try {
            await axios.delete(`http://localhost:8080/api/seats/${existingSeat.id}`);
            // Xóa khỏi state (ghế biến mất -> lộ ra ô xám)
            setSeats(prev => prev.filter(s => s.id !== existingSeat.id));
        } catch (err) { alert("Lỗi xóa ghế"); }
        return;
    }

    // 2. CÁC TOOL KHÁC (VIP/NORMAL/COUPLE)
    if (existingSeat) {
        // Nếu ghế ĐANG TỒN TẠI -> Update loại
        if (existingSeat.type === selectedTool) return;
        try {
            await axios.put(`http://localhost:8080/api/seats/${existingSeat.id}`, { type: selectedTool });
            setSeats(prev => prev.map(s => s.id === existingSeat.id ? { ...s, type: selectedTool } : s));
        } catch (err) { alert("Lỗi update ghế"); }
    } else {
        // Nếu là Ô TRỐNG -> Tạo lại ghế (Khôi phục ghế đã xóa)
        try {
            const rowChar = String.fromCharCode(64 + r); // 1->A
            const seatCode = `${rowChar}${c}`;
            const payload = {
                seatCode: seatCode,
                rowIndex: r,
                colIndex: c,
                type: selectedTool,
                roomId: room.id // Cần backend hỗ trợ nhận roomId trong body hoặc URL
            };
            
            // Cần 1 API tạo ghế lẻ (nếu chưa có thì phải thêm ở Backend)
            // Tạm thời alert nếu chưa có API này
            alert("Tính năng khôi phục ghế đang phát triển (Cần thêm API createSeat)");
            // Nếu bạn muốn làm luôn: await axios.post("/api/seats", payload)...
        } catch (err) { alert("Lỗi tạo ghế"); }
    }
  };

  const getSeatColor = (seat) => {
      if (!seat) return 'bg-neutral-800/50 border-dashed border-neutral-700 text-neutral-700'; // Ô trống (Đã xóa)
      
      switch(seat.type) {
          case 'VIP': return 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50';
          case 'COUPLE': return 'bg-pink-600 border-pink-500 text-white w-20 shadow-lg shadow-pink-900/50';
          default: return 'bg-neutral-700 border-neutral-500 text-neutral-300'; // NORMAL
      }
  };

  // --- TẠO LƯỚI TĨNH DỰA TRÊN KÍCH THƯỚC PHÒNG ---
  const renderGrid = () => {
    const grid = [];
    for (let r = 1; r <= room.totalRows; r++) {
        const rowCells = [];
        const rowLabel = String.fromCharCode(64 + r); // A, B, C...

        for (let c = 1; c <= room.totalCols; c++) {
            // Tìm xem có ghế nào ở vị trí (r, c) không
            const seat = seats.find(s => s.rowIndex === r && s.colIndex === c);
            
            rowCells.push(
                <div 
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c, seat)}
                    className={`
                        h-9 w-9 flex items-center justify-center rounded cursor-pointer transition-all select-none text-xs border
                        ${getSeatColor(seat)}
                        ${selectedTool === 'DELETE' && seat ? 'hover:bg-red-900 hover:border-red-500' : 'hover:brightness-110'}
                    `}
                    title={seat ? `${seat.seatCode} (${seat.type})` : `Ô trống (R${r}-C${c})`}
                >
                    {seat ? seat.seatCode.substring(1) : ""} 
                </div>
            );
        }
        
        // Đẩy cả hàng vào grid
        grid.push(
            <div key={r} className="flex gap-2 items-center justify-center">
                <span className="w-6 text-center font-bold text-neutral-500">{rowLabel}</span>
                {rowCells}
            </div>
        );
    }
    return grid;
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      {/* HEADER (Giữ nguyên) */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-neutral-900 z-10 py-4 border-b border-neutral-800">
        <div>
            <button onClick={onBack} className="text-neutral-400 hover:text-white mb-2">← Quay lại danh sách</button>
            <h2 className="text-2xl font-bold text-yellow-500">Thiết Kế: {room.name}</h2>
            <p className="text-sm text-neutral-500">Kích thước: {room.totalRows} hàng x {room.totalCols} cột</p>
        </div>

        <div className="flex gap-2 bg-neutral-800 p-2 rounded-lg border border-neutral-700">
             {/* Toolbar Buttons (Giữ nguyên) */}
             <button onClick={() => setSelectedTool("NORMAL")} className={`px-4 py-2 rounded font-bold ${selectedTool === 'NORMAL' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:bg-neutral-700'}`}>Thường</button>
             <button onClick={() => setSelectedTool("VIP")} className={`px-4 py-2 rounded font-bold ${selectedTool === 'VIP' ? 'bg-red-600 text-white' : 'text-red-400 hover:bg-neutral-700'}`}>VIP</button>
             <button onClick={() => setSelectedTool("DELETE")} className={`px-4 py-2 rounded font-bold ${selectedTool === 'DELETE' ? 'bg-red-900 text-red-200' : 'text-neutral-400 hover:bg-neutral-700'}`}>🗑 Xóa (Lối đi)</button>
        </div>
      </div>

      {/* KHU VỰC VẼ GHẾ (GRID MỚI) */}
      <div className="flex justify-center overflow-auto pb-20">
         <div className="flex flex-col gap-2">
            {renderGrid()}
         </div>
      </div>
      
      {/* Màn hình */}
      <div className="text-center mt-8">
        <div className="w-1/2 h-2 bg-yellow-500 mx-auto rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)]"></div>
        <p className="text-neutral-500 mt-2 text-sm uppercase">Màn hình chiếu</p>
      </div>
    </div>
  );
};

export default SeatDesigner;