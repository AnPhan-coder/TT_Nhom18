import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { ArrowLeft, CheckCircle, Film } from "lucide-react";
import axiosClient from "../../api/axiosClient";

const ShowtimeForm = ({ movies, rooms, allShowtimes, onBack, onSuccess }) => {
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

  const currentMovieShowtimes = useMemo(() => {
    if (!formData.movieId) return [];
    const list = allShowtimes.filter((s) => s.movie.id === Number(formData.movieId));
    return list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [formData.movieId, allShowtimes]);

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
      const url = formData.isAutoGenerate
        ? "/admin/showtimes/auto-generate"
        : "/admin/showtimes";

      const res = await axiosClient.post(url, {
        movieId: Number(formData.movieId),
        roomId: Number(formData.roomId),
        startTime: formData.startTime,
        basePrice: Number(formData.basePrice),
      });

      toast.success(res.data.message || "✅ Thành công!");
      
      if (onSuccess) onSuccess();
      
      setFormData({
        ...formData,
        startTime: "",
        isAutoGenerate: false,
      });
      setCalculatedEndTime("");
    } catch (error) {
      toast.error("❌ Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
      <div className="lg:col-span-1 bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-2xl h-fit">
        <button onClick={onBack} className="text-neutral-400 hover:text-white mb-6 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} /> Quay lại
        </button>

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

          <div className="grid grid-cols-1 gap-6">
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
                type="number" step="5000" min="45000" max="200000"
                className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-yellow-500 outline-none font-mono"
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                value={formData.basePrice}
              />
            </div>
          </div>

          {calculatedEndTime && (
            <div className="bg-neutral-900/50 p-4 rounded-lg border border-dashed border-neutral-600 text-sm flex justify-between items-center">
              <div>
                <p className="text-neutral-400">Kết thúc lúc:</p>
                <p className="text-yellow-500 font-bold text-lg">{calculatedEndTime}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-500 text-xs">{selectedMovieDuration}p + 15p dọn</p>
              </div>
            </div>
          )}

          <div
            onClick={() => setFormData({ ...formData, isAutoGenerate: !formData.isAutoGenerate })}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-4 ${
              formData.isAutoGenerate
                ? "bg-green-900/20 border-green-500 ring-1 ring-green-500"
                : "bg-neutral-900 border-neutral-600 hover:bg-neutral-800"
            }`}
          >
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${formData.isAutoGenerate ? "bg-green-500 border-green-500" : "border-neutral-500"}`}>
              {formData.isAutoGenerate && <CheckCircle size={16} className="text-neutral-900" />}
            </div>
            <div>
              <h4 className={`font-bold ${formData.isAutoGenerate ? "text-green-500" : "text-neutral-300"}`}>Tự động sinh lịch</h4>
              <p className="text-xs text-neutral-500">Xếp lịch liên tục đến 23:00</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold uppercase tracking-wider shadow-lg transform transition-all hover:-translate-y-1 ${
              loading ? "bg-neutral-600 cursor-not-allowed" : "bg-yellow-500 text-neutral-900 hover:bg-yellow-400"
            }`}
          >
            {loading ? "Đang xử lý..." : formData.isAutoGenerate ? "TẠO HÀNG LOẠT" : "TẠO SUẤT CHIẾU"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-neutral-800 rounded-xl border border-neutral-700 h-full overflow-hidden flex flex-col">
          <div className="p-4 bg-neutral-900/50 border-b border-neutral-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Film className="text-yellow-500" />
              Lịch chiếu đã có: 
              <span className="text-yellow-500 ml-1">
                {movies.find((m) => m.id === parseInt(formData.movieId))?.title || "---"}
              </span>
            </h3>
            <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
              {currentMovieShowtimes.length} suất
            </span>
          </div>

          <div className="p-4 overflow-y-auto max-h-[600px] space-y-3">
            {!formData.movieId ? (
              <div className="text-center text-neutral-500 py-10 italic">
                Vui lòng chọn phim để xem lịch chiếu hiện có
              </div>
            ) : currentMovieShowtimes.length === 0 ? (
              <div className="text-center text-neutral-500 py-10">
                Chưa có lịch chiếu nào cho phim này.
              </div>
            ) : (
              Object.entries(currentMovieShowtimes.reduce((acc, show) => {
                const date = show.startTime.split('T')[0];
                if (!acc[date]) acc[date] = [];
                acc[date].push(show);
                return acc;
              }, {})).map(([date, shows]) => (
                <div key={date} className="mb-4">
                  <h4 className="text-neutral-400 text-sm font-bold border-b border-neutral-700 pb-1 mb-2">
                    Ngày {format(new Date(date), "dd/MM/yyyy")}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {shows.map((show) => (
                      <div key={show.id} className="bg-neutral-900 p-3 rounded border border-neutral-700 text-sm">
                        <div className="text-yellow-500 font-bold">
                          {format(new Date(show.startTime), "HH:mm")}
                          <span className="text-neutral-600 font-normal"> - {format(new Date(show.endTime), "HH:mm")}</span>
                        </div>
                        <div className="text-white mt-1 text-xs font-medium">{show.room.name}</div>
                        <div className="text-neutral-500 text-xs mt-1">Ghế trống: {show.notBooked}/{show.totalSeats}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeForm;