import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SeatIcon = ({ type, isSelected, isHidden, label }) => {
  if (isHidden) {
    return (
      <div className="w-10 h-10 flex items-center justify-center opacity-20">
        <div className="w-1 h-1 bg-white rounded-full"></div>
      </div>
    );
  }

  let fillColor = "#525252";
  if (type === "VIP") fillColor = "#DC2626"; 
  if (type === "COUPLE") fillColor = "#DB2777"; 
  

  const opacity = isSelected ? "opacity-100" : "opacity-100";
  const hoverEffect = "group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all";


  if (type === "COUPLE") {
    return (
      <div className={`relative w-24 h-10 flex justify-center items-end cursor-pointer group ${opacity}`}>
        <svg width="100%" height="100%" viewBox="0 0 100 45" fill="none" className={hoverEffect}>
           <path d="M10 10 C 10 0, 90 0, 90 10 L 90 35 L 10 35 Z" fill={fillColor} />
           <rect x="0" y="15" width="8" height="30" rx="4" fill={fillColor} className="brightness-110"/>
           <rect x="92" y="15" width="8" height="30" rx="4" fill={fillColor} className="brightness-110"/>
           <rect x="8" y="30" width="84" height="12" rx="2" fill={fillColor} className="brightness-90"/>
        </svg>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold select-none pointer-events-none">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-10 h-10 flex justify-center items-end cursor-pointer group ${opacity}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={hoverEffect}>
         <path d="M5 10 C 5 0, 35 0, 35 10 L 35 30 L 5 30 Z" fill={fillColor} />
         <rect x="0" y="15" width="6" height="22" rx="2" fill={fillColor} className="brightness-110"/>
         <rect x="34" y="15" width="6" height="22" rx="2" fill={fillColor} className="brightness-110"/>
         <rect x="5" y="26" width="30" height="10" rx="2" fill={fillColor} className="brightness-90"/>
      </svg>
      <span className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-[10px] font-bold select-none pointer-events-none">
          {label}
      </span>
    </div>
  );
};

const SeatDesigner = ({ room, onBack }) => {
  const [seats, setSeats] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedTool, setSelectedTool] = useState("NORMAL");

  useEffect(() => {
    if (room) loadSeats();
  }, [room]);

  const loadSeats = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/seats?roomId=${room.id}`);
      const sortedSeats = res.data.result.sort((a, b) => 
          a.rowIndex === b.rowIndex ? a.colIndex - b.colIndex : a.rowIndex - b.rowIndex
      );
      setSeats(sortedSeats || []);
      setIsDirty(false);
    } catch (error) { console.error(error); }
  };

  const handleCellClick = (r, c) => {
    const seatIndex = seats.findIndex(s => s.rowIndex === r && s.colIndex === c);
    if (seatIndex === -1) return;

    const newSeats = [...seats];
    const seat = newSeats[seatIndex];

    if (selectedTool === "TOGGLE") {
        seat.active = !seat.active; 
    } else if (selectedTool === "COUPLE") {
        if (c % 2 !== 0 && c < room.totalCols) {
            seat.type = "COUPLE";
            seat.active = true;
            const nextSeat = newSeats.find(s => s.rowIndex === r && s.colIndex === c + 1);
            if (nextSeat) nextSeat.active = false;
        }
    } else {
        seat.type = selectedTool;
        seat.active = true;
    }
    setSeats(newSeats);
    setIsDirty(true);
  };
  const handleRowClick = (rowIdx) => {
    const firstSeatInRow = seats.find(s => s.rowIndex === rowIdx);
      const isRowActive = firstSeatInRow ? firstSeatInRow.active : false;
      const newSeats = seats.map(seat => {
          if (seat.rowIndex !== rowIdx) return seat;

          if (selectedTool === "TOGGLE") {
              return { ...seat, active: !isRowActive };
          } 
          
          if (selectedTool === "COUPLE") {
              if (seat.colIndex % 2 !== 0 && seat.colIndex < room.totalCols) {
                   return { ...seat, type: "COUPLE", active: true };
              } else if (seat.colIndex % 2 === 0) {
                   return { ...seat, active: false }; 
              }
              return { ...seat, type: "NORMAL", active: true };
          }
          return { ...seat, type: selectedTool, active: true };
      });

      setSeats(newSeats);
      setIsDirty(true);
  };
  const handleSave = async () => {  
    Swal.fire({
      title: "Lưu thay đổi?",
      text: "Cập nhật sơ đồ ghế mới cho hệ thống bán vé.",
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#EAB308",
      cancelButtonColor: "#404040",
      confirmButtonText: "Lưu ngay",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
          try {
            await axios.post("http://localhost:8080/api/seats/batch-update", seats);
            
            toast.success("✅ Đã lưu sơ đồ thành công!");
            setIsDirty(false);
        } catch (error) {
            toast.error("❌ Lỗi: " + error.message);
        }
      }
    });
  };
const getAisleColumns = () => {
    const totalCols = room.totalCols;
    const centerBlock = 8; // Quy tắc: Khối giữa tối đa 8 ghế

    // Nếu phòng nhỏ hơn hoặc bằng 8 cột thì không cần chia lối đi
    if (totalCols <= centerBlock) return [];

    const sideBlock = Math.floor((totalCols - centerBlock) / 2);
    
    // Lối đi 1: Sau khối bên trái
    // Lối đi 2: Sau khối giữa (Tức là trước khối bên phải)
    return [sideBlock, sideBlock + centerBlock];
  };

  const aisleCols = getAisleColumns();
  const renderGrid = () => {
    const grid = [];
    for (let r = 1; r <= room.totalRows; r++) {
        const rowCells = [];
        const rowLabel = String.fromCharCode(64 + r);

        for (let c = 1; c <= room.totalCols; c++) {
            const seat = seats.find(s => s.rowIndex === r && s.colIndex === c);
            
            if (seat) {
                 const prevSeat = seats.find(s => s.rowIndex === r && s.colIndex === c - 1);
                 if (prevSeat && prevSeat.type === "COUPLE" && prevSeat.active) continue;
            }
const isAisle = aisleCols.includes(c);
            const marginClass = isAisle ? "mr-12" : "mr-1";
            rowCells.push(
                <div key={`${r}-${c}`} onClick={() => seat && handleCellClick(r, c)} className={`m-1 ${marginClass}`}>
                   <SeatIcon 
                      type={seat?.type || "NORMAL"} 
                      isHidden={!seat?.active} 
                      isSelected={selectedTool !== 'TOGGLE'}
                      label={seat && seat.seatCode ? seat.seatCode.substring(1) : ""}
                   />
                </div>
            );
        }
        const RowLabelButton = () => (
            <button 
                onClick={() => handleRowClick(r)}
                className="w-10 h-10 flex items-center justify-center font-bold text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors text-lg"
                title={`Click để set cả hàng ${rowLabel} thành ${selectedTool}`}
            >
                {rowLabel}
            </button>
        );
        grid.push(
            <div key={r} className="flex justify-center items-end whitespace-nowrap group/row">
                <div className="pr-4"><RowLabelButton /></div>
                {rowCells}
                <div className="pl-4"><RowLabelButton /></div>
            </div>
        );
    }
    return grid;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-neutral-900 text-white w-full">
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-20 shadow-lg">
            <div>
                <button onClick={onBack} className="flex items-center text-neutral-400 hover:text-white mb-1">← Quay lại</button>
                <h2 className="text-2xl font-bold text-yellow-500">Sơ đồ: {room.name}</h2>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="bg-neutral-800 p-1.5 rounded-lg flex gap-1 border border-neutral-700">
                    {[
                        { id: 'NORMAL', label: 'Thường', color: 'bg-neutral-600' },
                        { id: 'VIP', label: 'VIP', color: 'bg-red-600' },
                        { id: 'COUPLE', label: 'Couple', color: 'bg-pink-600' },
                        { id: 'TOGGLE', label: 'Bật/Tắt (X)', color: 'bg-yellow-600 text-black' }
                    ].map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${selectedTool === tool.id ? `${tool.color} text-white` : 'text-neutral-400 hover:bg-neutral-700'}`}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={!isDirty}
                    className={`px-6 py-2.5 rounded-lg font-bold uppercase ${isDirty ? 'bg-green-600 hover:bg-green-500' : 'bg-neutral-800 text-neutral-500'}`}
                >
                    {isDirty ? "Lưu Thay Đổi" : "Đã Đồng Bộ"}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-auto p-8">
                <div className="min-w-max flex flex-col items-center pb-20">
                    
                    <div className="w-[600px] mb-12 relative group shrink-0">
                        <div className="h-2 w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full shadow-[0_5px_30px_rgba(234,179,8,0.4)]"></div>
                        <div className="absolute top-4 left-0 w-full text-center text-neutral-500 text-sm uppercase tracking-[0.5em]">Màn hình chiếu</div>
                    </div>

                    <div className="bg-neutral-800/30 p-10 rounded-3xl border border-neutral-800/50 shadow-2xl backdrop-blur-sm inline-block">
                        <div className="flex flex-col gap-1">
                            {renderGrid()}
                        </div>
                    </div>

                    <div className="mt-12 flex gap-8 text-sm text-neutral-400 bg-neutral-800 px-8 py-4 rounded-full border border-neutral-700 shrink-0">
                        <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-neutral-600"></div> Ghế Thường</div>
                        <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-red-600"></div> Ghế VIP</div>
                        <div className="flex items-center gap-3"><div className="w-8 h-5 rounded bg-pink-600"></div> Ghế Couple</div>
                        <div className="flex items-center gap-3 opacity-50"><div className="w-2 h-2 rounded-full bg-white"></div> Lối đi</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SeatDesigner;