import React, { useState, useEffect } from 'react';
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

    return (
        <div className="bg-neutral-800 p-8 rounded-lg max-w-4xl mx-auto border border-neutral-700 mt-10">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {TEMPLATES.map(tpl => (
                                <div 
                                    key={tpl.id}
                                    onClick={() => handleTemplateSelect(tpl)}
                                    className={`p-4 rounded border cursor-pointer transition-all ${
                                        formData.templateType === tpl.id 
                                        ? 'bg-neutral-700 border-yellow-500 ring-1 ring-yellow-500' 
                                        : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className="font-bold text-white mb-1">{tpl.name}</div>
                                    <div className="text-xs text-neutral-400 mb-2">{tpl.desc}</div>
                                    <div className="text-xs bg-neutral-800 inline-block px-2 py-1 rounded text-neutral-300">
                                        Kích thước: {tpl.rows}x{tpl.cols}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isEdit && (
                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-neutral-900 rounded border border-neutral-700">
                        <div>
                            <label className="block text-neutral-500 text-sm mb-1">Số Hàng (Rows)</label>
                            <input type="number" className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-600"
                                value={formData.totalRows}
                                onChange={e => setFormData({...formData, totalRows: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-neutral-500 text-sm mb-1">Số Cột (Cols)</label>
                            <input type="number" className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-600"
                                value={formData.totalCols}
                                onChange={e => setFormData({...formData, totalCols: parseInt(e.target.value)})}
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
    );
};

export default RoomForm;