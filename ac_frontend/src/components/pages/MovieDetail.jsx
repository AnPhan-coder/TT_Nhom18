import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, showtimeRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/movies/${id}`),
          axios.get(`http://localhost:8080/api/showtimes/movie?movieId=${id}`),
        ]);

setMovie(movieRes.data.result || movieRes.data);        setShowtimes(showtimeRes.data.result || showtimeRes.data || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return <div className="text-center pt-20 text-white">Đang tải...</div>;
  if (!movie)
    return (
      <div className="text-center pt-20 text-white">Không tìm thấy phim</div>
    );

  const groupShowtimesByDate = () => {
    const groups = {};
    if (Array.isArray(showtimes)) {
        showtimes.forEach((show) => {
        if (!show.startTime) return;

        try {
            const dateKey = format(new Date(show.startTime), "dd/MM/yyyy");
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(show);
        } catch (e) {
            console.warn("Bỏ qua suất chiếu lỗi ngày:", show);
        }
        });
    }
    return groups;
  };

  const showtimeGroups = groupShowtimesByDate();

  return (
    <div className="detail-container">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-1">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full rounded-lg shadow-2xl border border-neutral-700"
          />
        </div>

        <div className="md:col-span-2 text-neutral-300">
          <h1 className="text-4xl font-bold text-white mb-4 uppercase">
            {movie.title}
          </h1>
          <div className="flex gap-4 text-sm mb-6">
            <span className="bg-yellow-500 text-neutral-900 px-2 py-1 rounded font-bold">
              {movie.duration} phút
            </span>
            <span className="border border-neutral-600 px-2 py-1 rounded">
              {movie.genres && movie.genres.length > 0 
                  ? movie.genres.map(g => g.name).join(", ") 
                  : "Chưa cập nhật"}
            </span>
          </div>

          <p className="mb-6 leading-relaxed text-neutral-400">
            {movie.description || "Đang cập nhật mô tả..."}
          </p>

          <div className="mb-6">
            <h3 className="text-white font-bold mb-2">Đạo diễn</h3>
            <p className="text-sm">
             {movie.director || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Diễn viên:</h3>
            <p className="text-sm">
              {movie.actors && movie.actors.length > 0
                ? movie.actors.map(a => a.name).join(", ")
                : "Chưa cập nhật"}
            </p>
          </div>

          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Xem Trailer
            </a>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-neutral-800 p-8 rounded-xl border border-neutral-700">
        <h2 className="text-2xl text-white font-bold mb-6 border-l-4 border-yellow-500 pl-4">
          LỊCH CHIẾU
        </h2>

        {Object.keys(showtimeGroups).length === 0 ? (
          <p className="text-neutral-500 italic">
            Chưa có lịch chiếu cho phim này.
          </p>
        ) : (
          Object.keys(showtimeGroups).map((date) => (
            <div key={date} className="mb-8 last:mb-0">
              <h3 className="text-yellow-500 font-bold mb-3">{date}</h3>
              <div className="flex flex-wrap gap-4">
                {showtimeGroups[date].map((show) => (
                  <button
                    key={show.id}
                    className="btn-showtime group"
                    onClick={() => navigate(`/booking/${show.id}`)}
                  >
                    <span className="border border-neutral-600 px-2 py-1 rounded">
                      {movie.releaseDate
                        ? format(new Date(movie.releaseDate), "dd/MM/yyyy")
                        : "Chưa cập nhật"}
                    </span>
                    <span className="text-xs text-neutral-500 group-hover:text-yellow-500/80">
                      {show.room.name}
                      {show.startTime
                        ? format(new Date(show.startTime), "HH:mm")
                        : "--:--"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
