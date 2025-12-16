import React, { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Film, Calendar, Clock, Plus, Trash2, ArrowLeft, CheckCircle } from "lucide-react";

const ManageShowtimes = () => {
  const [view, setView] = useState("LIST"); 
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expandedMovieId, setExpandedMovieId] = useState(null); 

  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",
    startTime: "",
    basePrice: 75000,
    isAutoGenerate: false, 
  });

  const [selectedMovieDuration, setSelectedMovieDuration] = useState(0);
  const [calculatedEndTime, setCalculatedEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resMovies, resRooms, resShows] = await Promise.all([
        axios.get("http://localhost:8080/api/movies"),
        axiosClient.get("/rooms"),
        axiosClient.get("/admin/showtimes"),
      ]);

      setMovies(resMovies.data.result || resMovies.data || []);
      setRooms(resRooms.data.result || []);
      setShowtimes(resShows.data.result || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    }
  };

  const groupedShowtimes = useMemo(() => {
    const groups = {};
    showtimes.forEach((show) => {
      const mId = show.movie.id;
      if (!groups[mId]) {
        groups[mId] = {
          movie: show.movie,
          shows: [],
        };
      }
      groups[mId].shows.push(show);
    });
    return Object.values(groups); 
  }, [showtimes]);

  const handleMovieChange = (e) => {
    const mId = e.target.value;
    setFormData({ ...formData, movieId: mId });
    const movie = movies.find((m) => m.id === parseInt(mId));
    if (movie) {
      setSelectedMovieDuration(movie.duration);
      calculateEndTime(formData.startTime, movie.duration);
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, startTime: val });
    calculateEndTime(val, selectedMovieDuration);
  };

  const calculateEndTime = (startStr, duration) => {
    if (!startStr || !duration) {
        setCalculatedEndTime("");
        return;
    }
    const startDate = new Date(startStr);
    const endDate = new Date(startDate.getTime() + (duration + 15) * 60000);
    setCalculatedEndTime(format(endDate, "HH:mm - dd/MM/yyyy"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.roomId || !formData.startTime) {
      toast.warning("Vui lòng điền đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const url = formData.isAutoGenerate ? "/admin/showtimes/auto-generate" : "/admin/showtimes";
      
      const res = await axiosClient.post(url, {
        movieId: Number(formData.movieId),
        roomId: Number(formData.roomId),
        startTime: formData.startTime,
        basePrice: Number(formData.basePrice),
      });

      toast.success(res.data.message || "✅ Thành công!");
      
      loadData();
      setView("LIST"); 
      setFormData({
        movieId: "", roomId: "", startTime: "", basePrice: 75000, isAutoGenerate: false
      });
    } catch (error) {
      toast.error("❌ Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Xóa suất chiếu này?",
      icon: "warning",
      background: "#171717", color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Xóa",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosClient.delete(`/admin/showtimes/${id}`);
          toast.success("Đã xóa!");
          loadData();
        } catch (err) {
          toast.error("Lỗi xóa");
        }
      }
    });
  };

  if (view === "LIST") {
    return (
      <div className="p-8 text-white max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar /> Quản Lý Lịch Chiếu
          </h2>
          <button
            onClick={() => setView("CREATE")}
            className="bg-yellow-500 text-neutral-900 px-6 py-2.5 rounded-lg font-bold hover:bg-yellow-400 flex items-center gap-2 shadow-lg hover:translate-y-[-2px] transition-all"
          >
            <Plus size={20} /> Tạo Lịch Mới
          </button>
        </div>

        <div className="space-y-4">
          {groupedShowtimes.length === 0 ? (
            <div className="text-center p-12 bg-neutral-800 rounded-lg border border-dashed border-neutral-700 text-neutral-500">
              Chưa có lịch chiếu nào. Hãy tạo mới!
            </div>
          ) : (
            groupedShowtimes.map((group) => (
              <div key={group.movie.id} className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                <div
                  onClick={() => setExpandedMovieId(expandedMovieId === group.movie.id ? null : group.movie.id)}
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img src={group.movie.posterUrl} alt="" className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{group.movie.title}</h3>
                      <p className="text-sm text-neutral-400">{group.movie.duration} phút • {group.shows.length} suất chiếu</p>
                    </div>
                  </div>
                  <div className={`transform transition-transform ${expandedMovieId === group.movie.id ? "rotate-180" : ""}`}>
                    ▼
                  </div>
                </div>

                {expandedMovieId === group.movie.id && (
                  <div className="border-t border-neutral-700 bg-neutral-900/50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.shows.sort((a,b) => new Date(a.startTime) - new Date(b.startTime)).map((show) => (
                        <div key={show.id} className="bg-neutral-800 p-4 rounded border border-neutral-600 flex justify-between items-center group relative">
                          <div>
                            <div className="text-yellow-500 font-bold text-lg flex items-center gap-2">
                                <Clock size={16}/> 
                                {format(new Date(show.startTime), "HH:mm")}
                                <span className="text-neutral-500 text-xs font-normal">→ {show.endTime ? format(new Date(show.endTime), "HH:mm") : "..."}</span>
                            </div>
                            <div className="text-sm text-neutral-400 mt-1">{format(new Date(show.startTime), "dd/MM/yyyy")}</div>
                            <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{show.room.name}</div>
                          </div>
                          
                          <button
                            onClick={() => handleDelete(show.id)}
                            className="p-2 bg-neutral-700 text-red-400 rounded hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa lịch này"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-white max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
      <button onClick={() => setView("LIST")} className="text-neutral-400 hover:text-white mb-6 flex items-center gap-2 w-fit">
        <ArrowLeft size={20} /> Quay lại danh sách
      </button>

      <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase text-center border-b border-neutral-700 pb-4">
          Thiết lập Lịch Chiếu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-neutral-400 mb-2 font-medium">Chọn Phim</label>
            <select
              className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-yellow-500 outline-none"
              onChange={handleMovieChange}
              value={formData.movieId}
            >
              <option value="">-- Chọn Phim --</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.duration}p)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 mb-2 font-medium">Chọn Phòng Chiếu</label>
            <select
              className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-yellow-500 outline-none"
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-neutral-400 mb-2 font-medium">Bắt đầu từ</label>
              <input
                type="datetime-local"
                className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-yellow-500 outline-none"
                onChange={handleDateChange}
                value={formData.startTime}
              />
            </div>
            <div>
                <label className="block text-neutral-400 mb-2 font-medium">Giá vé cơ bản</label>
                <input
                    type="number" step="5000" min="45000"
                    className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-yellow-500 outline-none font-mono"
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    value={formData.basePrice}
                />
            </div>
          </div>

          {calculatedEndTime && (
             <div className="bg-neutral-900/50 p-4 rounded-lg border border-dashed border-neutral-600 text-sm flex justify-between items-center">
                 <div>
                    <p className="text-neutral-400">Suất đầu tiên kết thúc lúc:</p>
                    <p className="text-yellow-500 font-bold text-lg">{calculatedEndTime}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-neutral-500 text-xs">Thời lượng: {selectedMovieDuration}p</p>
                    <p className="text-neutral-500 text-xs">Dọn dẹp: 15p</p>
                 </div>
             </div>
          )}

          <div 
            onClick={() => setFormData({...formData, isAutoGenerate: !formData.isAutoGenerate})}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-4 ${
                formData.isAutoGenerate 
                ? "bg-green-900/20 border-green-500 ring-1 ring-green-500" 
                : "bg-neutral-900 border-neutral-600 hover:bg-neutral-800"
            }`}
          >
             <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${formData.isAutoGenerate ? "bg-green-500 border-green-500" : "border-neutral-500"}`}>
                {formData.isAutoGenerate && <CheckCircle size={16} className="text-neutral-900"/>}
             </div>
             <div>
                 <h4 className={`font-bold ${formData.isAutoGenerate ? "text-green-500" : "text-neutral-300"}`}>Tự động sinh lịch cả ngày</h4>
                 <p className="text-xs text-neutral-500">Hệ thống sẽ tự động xếp tiếp các suất chiếu liên tục từ giờ bắt đầu cho đến khi đóng cửa (23:00).</p>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold uppercase tracking-wider shadow-lg transform transition-all hover:-translate-y-1 ${
              loading ? "bg-neutral-600 cursor-not-allowed" : "bg-yellow-500 text-neutral-900 hover:bg-yellow-400"
            }`}
          >
            {loading ? "Đang xử lý..." : formData.isAutoGenerate ? "TẠO HÀNG LOẠT SUẤT CHIẾU" : "TẠO 1 SUẤT CHIẾU"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageShowtimes;