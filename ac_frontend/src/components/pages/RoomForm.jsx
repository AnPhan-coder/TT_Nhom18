import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
const RoomForm = ({ roomData, onBack }) => {
    const isEdit = !!roomData; 

    const [formData, setFormData] = useState({
        name: '',
        cinemaId: 1,
        totalRows: 10,
        totalCols: 10,
        templateType: 'STANDARD' 
    });

    const TEMPLATES = [
        { id: 'STANDARD', name: 'Mẫu Tiêu Chuẩn', desc: 'Toàn bộ ghế thường', rows: 10, cols: 12 },
        { id: 'VIP_HALL', name: 'Phòng VIP', desc: '3 hàng đầu thường, còn lại VIP', rows: 10, cols: 15 },
        { id: 'COUPLE_SWEET', name: 'Phòng Couple', desc: 'Có ghế đôi ở 2 hàng cuối', rows: 12, cols: 12 },
    ];

    useEffect(() => {
        if (isEdit && roomData) {
            setFormData({
                name: roomData.name,
                cinemaId: roomData.cinema?.id || 1,
                totalRows: roomData.totalRows,
                totalCols: roomData.totalCols,
                templateType: 'STANDARD'
            });
        }
    }, [isEdit, roomData]);

    const handleTemplateSelect = (tpl) => {
        if (isEdit) return;
        setFormData({
            ...formData,
            templateType: tpl.id,
            totalRows: tpl.rows,
            totalCols: tpl.cols
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/api/rooms/${roomData.id}`, { name: formData.name });
                
                toast.success("Cập nhật tên phòng thành công!");
            } else {
                await axios.post("http://localhost:8080/api/rooms", formData);
                
                toast.success("Tạo phòng và sinh ghế thành công!");
            }
            onBack();
        } catch (error) {
            toast.error("❌ Lỗi: " + (error.response?.data?.message || "Lỗi server"));
        }
    };
const renderPreview = useMemo(() => {
        const grid = [];
        const rows = formData.totalRows;
        const cols = formData.totalCols;
        const tpl = formData.templateType;

        for (let r = 1; r <= rows; r++) {
            const rowCells = [];
            for (let c = 1; c <= cols; c++) {
                let type = "NORMAL";
                let isHidden = false;
                let isCouple = false;

                if (tpl === 'VIP_HALL') {
                    if (r > 3) type = "VIP";
                } 
                else if (tpl === 'COUPLE_SWEET') {
                    if (r > rows - 2) {
                        if (c % 2 !== 0) {
                            type = "COUPLE";
                            isCouple = true;
                        } else {
                            isHidden = true; 
                        }
                    } else if (r > rows - 5) {
                        type = "VIP";
                    }
                }

                if (isHidden) continue; 

                let cellClass = "w-6 h-6 bg-neutral-600 rounded-sm";
                if (type === "VIP") cellClass = "w-6 h-6 bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]";
                if (type === "COUPLE") cellClass = "w-14 h-6 bg-pink-600 shadow-[0_0_5px_rgba(219,39,119,0.5)] col-span-2"; 

                rowCells.push(
                    <div key={`${r}-${c}`} className={`flex items-center justify-center text-[8px] text-white/50 select-none ${cellClass}`}>
                    </div>
                );
            }
            grid.push(<div key={r} className="flex justify-center gap-1 mb-1">{rowCells}</div>);
        }
        return grid;
    }, [formData.totalRows, formData.totalCols, formData.templateType]);
    return (
        <div className="bg-neutral-800 p-8 rounded-lg max-w-5xl mx-auto border border-neutral-700 mt-10 flex flex-col md:flex-row gap-8">
            
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-yellow-500 mb-6">
                    {isEdit ? "Chỉnh Sửa Tên Phòng" : "Thêm Phòng Theo Mẫu"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-neutral-400 mb-2">Tên Phòng</label>
                        <input 
                            type="text" required
                            className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded text-white focus:border-yellow-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-neutral-400 mb-3">Chọn Mẫu Sơ Đồ Ghế:</label>
                            <div className="grid grid-cols-1 gap-3">
                                {TEMPLATES.map(tpl => (
                                    <div 
                                        key={tpl.id}
                                        onClick={() => handleTemplateSelect(tpl)}
                                        className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center ${
                                            formData.templateType === tpl.id 
                                            ? 'bg-neutral-700 border-yellow-500 ring-1 ring-yellow-500' 
                                            : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-bold text-white text-sm">{tpl.name}</div>
                                            <div className="text-xs text-neutral-500">{tpl.desc}</div>
                                        </div>
                                        <div className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-300">
                                            {tpl.rows}x{tpl.cols}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isEdit && (
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-neutral-900 rounded border border-neutral-700">
                            <div>
                                <label className="block text-neutral-500 text-xs mb-1 uppercase">Số Hàng</label>
                                <input type="number" min="5" max="25" className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-600"
                                    value={formData.totalRows}
                                    onChange={e => setFormData({...formData, totalRows: parseInt(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className="block text-neutral-500 text-xs mb-1 uppercase">Số Cột</label>
                                <input type="number" min="5" max="30" className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-600"
                                    value={formData.totalCols}
                                    onChange={e => setFormData({...formData, totalCols: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onBack} className="px-6 py-3 bg-neutral-600 rounded font-bold hover:bg-neutral-500">Hủy</button>
                        <button type="submit" className="flex-1 bg-yellow-500 text-neutral-900 py-3 rounded font-bold hover:bg-yellow-400">
                            {isEdit ? "LƯU TÊN" : "TẠO PHÒNG"}
                        </button>
                    </div>
                </form>
            </div>

            {!isEdit && (
                <div className="flex-1 bg-neutral-900 p-6 rounded-lg border border-neutral-800 flex flex-col items-center justify-center min-h-[400px]">
                     <h3 className="text-neutral-500 uppercase tracking-widest text-xs mb-4">Xem trước sơ đồ</h3>
                     
                     <div className="w-full overflow-auto flex justify-center p-4 border border-dashed border-neutral-800 rounded bg-neutral-900/50">
                        <div className="scale-90 origin-top">
                            {renderPreview}
                        </div>
                     </div>

                     <div className="w-full h-1 bg-yellow-500/20 mt-6 rounded-full relative">
                        <div className="absolute inset-0 flex justify-center -top-2">
                             <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2">MÀN HÌNH</span>
                        </div>
                     </div>

                     <div className="flex gap-4 mt-6 text-xs text-neutral-400">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-neutral-600 rounded-sm"></div> Thường</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> VIP</div>
                        <div className="flex items-center gap-2"><div className="w-6 h-3 bg-pink-600 rounded-sm"></div> Couple</div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default RoomForm;