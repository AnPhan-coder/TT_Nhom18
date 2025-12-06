import React from 'react';
import ManageShowtimes from './ManageShowtimes';
const AdminDashboard = () => {
    return (
        <div className="pt-24 px-8 min-h-screen bg-neutral-900 text-white">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Trang Quản Trị (Admin Dashboard)</h1>
            <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700 gap-4 mb-8">
                <p>Chào mừng Admin quay trở lại!</p>
                <p>Tại đây bạn sẽ quản lý Phim, Suất chiếu và Đơn hàng.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                    <div className="lg:col-span-1 bg-neutral-800 p-6 rounded-lg h-fit">
                        <h3 className="text-xl text-yellow-500 font-bold mb-4">Menu</h3>
                        <ul className="space-y-2 text-neutral-400">
                            <li className="p-2 bg-neutral-700 text-white rounded cursor-pointer">Quản lý Lịch chiếu</li>
                            <li className="p-2 hover:bg-neutral-700 rounded cursor-pointer">Quản lý Phim (Sắp làm)</li>
                            <li className="p-2 hover:bg-neutral-700 rounded cursor-pointer">Thống kê (Sắp làm)</li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                         <ManageShowtimes />
                    </div>
                </div>
        </div>
    );
};

export default AdminDashboard;