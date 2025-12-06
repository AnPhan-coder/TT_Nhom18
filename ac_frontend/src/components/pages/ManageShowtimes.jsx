import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient"; 
import axios from "axios";

const ManageShowtimes = () => {
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",
    startTime: "", 
    basePrice: 75000,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMovies, resRooms] = await Promise.all([
            axios.get("http://localhost:8080/api/movies"), 
            axiosClient.get("/rooms") 
        ]);

        if(resMovies.data.result) setMovies(resMovies.data.result);
        else setMovies(resMovies.data); 

        if(resRooms.data.result) setRooms(resRooms.data.result);
      } catch (error) {
        console.error("Lỗi tải dữ liệu nguồn:", error);
        alert("Không thể tải danh sách phim hoặc phòng chiếu.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.movieId || !formData.roomId || !formData.startTime) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post("/admin/showtimes", {
        movieId: Number(formData.movieId),
        roomId: Number(formData.roomId),
        startTime: formData.startTime + ":00", 
        basePrice: Number(formData.basePrice),
      });

      if (response.data.code === 1000 || response.data.result) {
        alert("✅ Tạo lịch chiếu thành công!");
        // Reset form
        setFormData({ ...formData, startTime: "" });
      } else {
        alert("❌ Lỗi: " + response.data.message);
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
      const msg = error.response?.data?.message || "Lỗi Server hoặc Trùng lịch!";
      alert("❌ Thất bại: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-neutral-800 text-white rounded-lg max-w-2xl mx-auto mt-10 shadow-lg border border-neutral-700">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase text-center">
        Tạo Suất Chiếu Mới
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-neutral-400 mb-2">Chọn Phim</label>
          <select
            name="movieId"
            className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded text-white focus:border-yellow-500 outline-none"
            onChange={handleChange}
            value={formData.movieId}
          >
            <option value="">-- Chọn Phim --</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} (ID: {m.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-neutral-400 mb-2">Chọn Phòng Chiếu</label>
          <select
            name="roomId"
            className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded text-white focus:border-yellow-500 outline-none"
            onChange={handleChange}
            value={formData.roomId}
          >
            <option value="">-- Chọn Phòng --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} - {r.cinema?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 mb-2">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              name="startTime"
              className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded text-white focus:border-yellow-500 outline-none"
              onChange={handleChange}
              value={formData.startTime}
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-2">Giá vé cơ bản (VND)</label>
            <input
              type="number"
              name="basePrice"
              className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded text-white focus:border-yellow-500 outline-none"
              onChange={handleChange}
              value={formData.basePrice}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded font-bold uppercase transition-colors ${
            loading
              ? "bg-neutral-600 cursor-not-allowed"
              : "bg-yellow-500 text-neutral-900 hover:bg-yellow-400"
          }`}
        >
          {loading ? "Đang xử lý..." : "Tạo Lịch Chiếu"}
        </button>
      </form>
    </div>
  );
};

export default ManageShowtimes;