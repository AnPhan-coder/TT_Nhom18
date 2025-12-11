import React, { useState } from 'react';
import axios from 'axios';

const RoomForm = () => {
    const isEdit = !!roomData;
    const [formData, setFormData] = useState({
        name: '',
        cinemaId: 1,
        totalRows: 10,
        totalCols: 10
    });
useEffect(() => {
        if (isEdit && roomData) {
            setFormData({
                name: roomData.name,
                cinemaId: roomData.cinema?.id || 1,
                totalRows: roomData.totalRows,
                totalCols: roomData.totalCols
            });
        }
    }, [isEdit, roomData]);
    const PRESETS = {
        SMALL: { rows: 8, cols: 10, label: "Phòng Nhỏ (80 ghế)" },
        MEDIUM: { rows: 10, cols: 15, label: "Phòng Vừa (150 ghế)" },
        LARGE: { rows: 12, cols: 20, label: "Phòng Lớn (240 ghế)" },
        IMAX: { rows: 15, cols: 25, label: "IMAX (375 ghế)" }
    };

    const handlePresetChange = (type) => {
        if (isEdit) return; 
        if (PRESETS[type]) {
            setFormData({
                ...formData,
                totalRows: PRESETS[type].rows,
                totalCols: PRESETS[type].cols
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/api/rooms/${roomData.id}`, { name: formData.name });
                alert("✅ Cập nhật tên phòng thành công!");
            } else {
                await axios.post("http://localhost:8080/api/rooms", formData);
                alert("✅ Tạo phòng và sinh ghế thành công!");
            }
            
            onBack(); 
        } catch (error) {
            alert("❌ Lỗi: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

   return (
        <div className="bg-neutral-800 p-8 rounded-lg max-w-2xl mx-auto border border-neutral-700 mt-10">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6">
                {isEdit ? "Chỉnh Sửa Tên Phòng" : "Thêm Phòng Chiếu Mới"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-neutral-400 mb-2">Tên Phòng</label>
                    <input 
                        type="text" 
                        required
                        className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded text-white focus:border-yellow-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {!isEdit && (
                    <>
                        <div>
                            <label className="block text-neutral-400 mb-2">Chọn kích thước mẫu:</label>
                            <div className="flex gap-2 flex-wrap">
                                {Object.keys(PRESETS).map(key => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handlePresetChange(key)}
                                        className="px-4 py-2 bg-neutral-700 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                                    >
                                        {PRESETS[key].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-neutral-400 mb-2">Số Hàng (Dọc)</label>
                                <input 
                                    type="number" min="5" max="20"
                                    className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded text-white"
                                    value={formData.totalRows}
                                    onChange={e => setFormData({...formData, totalRows: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-neutral-400 mb-2">Số Cột (Ngang)</label>
                                <input 
                                    type="number" min="5" max="30"
                                    className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded text-white"
                                    value={formData.totalCols}
                                    onChange={e => setFormData({...formData, totalCols: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                    </>
                )}

                {isEdit && <p className="text-sm text-neutral-500 italic">* Không thể thay đổi kích thước phòng sau khi đã tạo.</p>}

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onBack} className="px-6 py-3 bg-neutral-600 rounded font-bold hover:bg-neutral-500">
                        Hủy
                    </button>
                    <button type="submit" className="flex-1 bg-yellow-500 text-neutral-900 py-3 rounded font-bold hover:bg-yellow-400">
                        {isEdit ? "LƯU THAY ĐỔI" : "TẠO PHÒNG NGAY"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomForm;