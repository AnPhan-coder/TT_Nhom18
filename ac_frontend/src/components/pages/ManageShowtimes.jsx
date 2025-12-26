import React, { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Calendar, Plus, Trash2, Search, Armchair } from "lucide-react";
import ShowtimeForm from "./ShowtimeForm";

const ManageShowtimes = () => {
  const [view, setView] = useState("LIST");
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expandedMovieId, setExpandedMovieId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchDate, setSearchDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    loadData();
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resMovies, resRooms, resShows] = await Promise.all([
        axiosClient.get("/movies"),
        axiosClient.get("/rooms"),
        axiosClient.get("/admin/showtimes"),
      ]);
      setMovies(resMovies.data.result || resMovies.data || []);
      setRooms(resRooms.data.result || []);
      setShowtimes(resShows.data.result || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedShowtimes = useMemo(() => {
    const groups = {};
    showtimes.forEach((show) => {
      const movieName = show.movie?.title?.toLowerCase() || "";
      const isNameMatch = searchTerm
        ? movieName.includes(searchTerm.toLowerCase())
        : true;

      const showDate = show.startTime
        ? new Date(show.startTime).toISOString().split("T")[0]
        : null;
      const isDateMatch = searchDate ? showDate === searchDate : true;

      if (searchTerm) {
        if (!isNameMatch) return;
      } else {
        if (!isDateMatch) return;
      }
      const mId = show.movie.id;
      if (!groups[mId]) {
        groups[mId] = { movie: show.movie, shows: [] };
      }
      groups[mId].shows.push(show);
    });
    return Object.values(groups);
  }, [showtimes, searchDate, debouncedSearchTerm]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Xóa suất chiếu này?",
      icon: "warning",
      background: "#171717",
      color: "#fff",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-white mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  if (view === "CREATE") {
    return (
      <div className="p-8 max-w-6xl mx-auto min-h-screen">
        <ShowtimeForm
          movies={movies}
          rooms={rooms}
          allShowtimes={showtimes}
          onBack={() => setView("LIST")}
          onSuccess={() => {
            loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
          <Calendar /> Quản Lý Lịch Chiếu
        </h2>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:border-yellow-500 block w-48 pl-10 p-2.5 outline-none"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              disabled={searchTerm.length > 0}
              className={`bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:border-yellow-500 block w-full p-2.5 outline-none 
          ${searchTerm.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
          <button
            onClick={() => setView("CREATE")}
            className="bg-yellow-500 text-neutral-900 px-6 py-2.5 rounded-lg font-bold hover:bg-yellow-400 flex items-center gap-2 shadow-lg hover:translate-y-0.5 transition-all whitespace-nowrap"
          >
            <Plus size={20} /> Tạo Lịch Mới
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {groupedShowtimes.length === 0 ? (
          <div className="text-center p-12 bg-neutral-800 rounded-lg border border-dashed border-neutral-700 text-neutral-500">
            Không tìm thấy lịch chiếu phù hợp.
          </div>
        ) : (
          groupedShowtimes.map((group) => (
            <div
              key={group.movie.id}
              className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden mb-6 shadow-lg"
            >
              <div
                onClick={() =>
                  setExpandedMovieId(
                    expandedMovieId === group.movie.id ? null : group.movie.id
                  )
                }
                className="p-5 flex justify-between items-start cursor-pointer hover:bg-neutral-700/30 transition-colors border-b border-neutral-700/50"
              >
                <div className="flex gap-5">
                  <img
                    src={group.movie.posterUrl || "/placeholder.jpg"}
                    alt={group.movie.title || "Poster"}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";    
                    }}
                    className="w-16 h-24 object-cover rounded-md shadow-md border border-neutral-600"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-1">
                      {group.movie.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                      <span className="bg-neutral-700 px-2 py-0.5 rounded text-xs text-white">
                        {group.movie.duration} phút
                      </span>
                      <span>•</span>
                      <span className="text-yellow-500 font-bold">
                        {group.shows.length} suất chiếu
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-neutral-500 transform transition-transform duration-300 ${
                    expandedMovieId === group.movie.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </div>
              </div>

              {expandedMovieId === group.movie.id && (
                <div className="p-5 bg-neutral-900/50">
                  {Object.entries(
                    group.shows.reduce((acc, show) => {
                      const date = show.startTime
                        ? new Date(show.startTime).toISOString().split("T")[0]
                        : null;
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(show);
                      return acc;
                    }, {})
                  )
                    .sort(
                      ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
                    )

                    .map(([date, showsInDate]) => (
                      <div key={date} className="mb-8 last:mb-0">
                        <h4 className="text-neutral-400 text-sm font-bold border-b border-neutral-700 pb-2 mb-4 flex items-center gap-2">
                          <Calendar size={16} />
                          Ngày {format(new Date(date), "dd/MM/yyyy")}
                          <span className="text-neutral-600 font-normal ml-2 text-xs">
                            ({showsInDate.length} suất)
                          </span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                          {showsInDate
                            .sort(
                              (a, b) =>
                                new Date(a.startTime) - new Date(b.startTime)
                            )
                            .map((show) => (
                              <div
                                key={show.id}
                                className="relative bg-neutral-800 p-4 rounded-lg border border-neutral-700 group hover:border-yellow-500/50 hover:bg-neutral-750 transition-all shadow-sm"
                              >
                                <div className="flex items-end gap-2 mb-3">
                                  <span className="text-2xl font-bold text-yellow-500 leading-none">
                                    {format(new Date(show.startTime), "HH:mm")}
                                  </span>
                                  <span className="text-xs text-neutral-500 mb-1">
                                    →{" "}
                                    {show.endTime
                                      ? format(new Date(show.endTime), "HH:mm")
                                      : "..."}
                                  </span>
                                </div>

                                <div className="mb-4">
                                  <div
                                    className="text-white font-bold uppercase text-sm truncate"
                                    title={show.room.name}
                                  >
                                    {show.room.name}
                                  </div>
                                  <div className="text-xs text-neutral-500 mt-1">
                                    {show.room.cinema?.name || "Rạp chính"}
                                  </div>
                                </div>

                                <div className="absolute bottom-4 right-4 bg-neutral-900/80 border border-neutral-600 rounded px-2 py-1.5 min-w-20 text-center backdrop-blur-sm">
                                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
                                    <Armchair size={10} /> Ghế trống
                                  </div>
                                  <div className="font-mono text-sm">
                                    <span className="text-red-500 font-bold">
                                      {show.notBooked || 0}
                                    </span>
                                    <span className="text-neutral-500 text-xs">
                                      {" "}
                                      / {show.totalSeats || 0}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(show.id);
                                  }}
                                  className="absolute top-3 right-3 p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                  title="Xóa suất chiếu này"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageShowtimes;
