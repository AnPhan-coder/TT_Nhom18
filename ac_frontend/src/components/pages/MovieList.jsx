import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieForm from "./MovieForm";
import Swal from "sweetalert2"; 
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom"; 

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState("list");
  const [genres, setGenres] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  
  const [searchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword");

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    genreId: "",
  });

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (keywordFromUrl) {
        setFilters(prev => ({ ...prev, keyword: keywordFromUrl }));
        loadMoviesWithFilter({ ...filters, keyword: keywordFromUrl });
    } else {
        loadMovies();
    }
  }, [keywordFromUrl]);

  const loadGenres = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/genres");
      setGenres(res.data);
    } catch (error) {
      console.error("Lỗi tải thể loại:", error);
    }
  };

  const loadMovies = async () => {
    loadMoviesWithFilter(filters);
  };

  const loadMoviesWithFilter = async (currentFilters) => {
    try {
      const params = {};
      if (currentFilters.keyword) params.keyword = currentFilters.keyword;
      if (currentFilters.status) params.status = currentFilters.status;
      if (currentFilters.genreId) params.genreId = currentFilters.genreId;

      const res = await axios.get("http://localhost:8080/api/movies/search", {
        params,
      });
      setMovies(res.data.result || res.data);
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMovies();
  };

  const handleReset = () => {
    setFilters({ keyword: "", status: "", genreId: "" });
    axios.get("http://localhost:8080/api/movies/search").then((res) => {
      setMovies(res.data.result || res.data);
    });
  };

  const handleDelete = async (id) => {
   Swal.fire({
      title: "Xóa phim này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#404040",
      confirmButtonText: "Xóa luôn",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8080/api/movies/${id}`);
          toast.success("✅ Đã xóa phim thành công!");
          loadMovies();
        } catch (error) {
          toast.error("❌ Lỗi xóa phim: " + (error.response?.data?.message || "Lỗi server"));
        }
      }
    });
  };
  const handleCreate = () => {
    setSelectedMovieId(null);
    setView("form");
  };
  const handleEdit = (id) => {
    setSelectedMovieId(id);
    setView("form");
  };
  const handleBack = () => {
    setView("list");
    loadMovies();
  };

  if (view === "form") {
    return <MovieForm movieId={selectedMovieId} onBack={handleBack} />;
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Quản Lý Phim</h2>
        <button
          onClick={handleCreate}
          className="bg-yellow-500 text-neutral-900 px-4 py-2 rounded font-bold hover:bg-yellow-400"
        >
          + Thêm Phim
        </button>
      </div>

      <div className="bg-neutral-900 p-4 rounded-lg mb-6 border border-neutral-700">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="text"
            name="keyword"
            placeholder="Nhập tên phim..."
            value={filters.keyword}
            onChange={handleFilterChange}
            className="bg-neutral-800 border border-neutral-600 text-white p-2 rounded focus:border-yellow-500 outline-none"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="bg-neutral-800 border border-neutral-600 text-white p-2 rounded focus:border-yellow-500 outline-none"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="upcoming">Sắp Chiếu</option>
            <option value="active">Đang Chiếu</option>
            <option value="finished">Ngừng Chiếu</option>
          </select>

          <select
            name="genreId"
            value={filters.genreId}
            onChange={handleFilterChange}
            className="bg-neutral-800 border border-neutral-600 text-white p-2 rounded focus:border-yellow-500 outline-none"
          >
            <option value="">-- Tất cả thể loại --</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex-1 font-bold"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-500 font-bold"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-yellow-500 border-b border-neutral-700">
              <th className="p-3">Poster</th>
              <th className="p-3">Tên Phim</th>
              <th className="p-3">Thể loại</th>
              <th className="p-3">Thời lượng</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-neutral-300">
            {movies.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-8 text-neutral-500 italic"
                >
                  Không tìm thấy phim nào phù hợp.
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr
                  key={movie.id}
                  className="border-b border-neutral-700 hover:bg-neutral-700/50"
                >
                  <td className="p-3">
                    <img
                      src={movie.posterUrl}
                      alt=""
                      className="w-12 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3 font-medium">{movie.title}</td>
                  <td className="p-3 text-sm text-neutral-400">
                    {movie.genres && movie.genres.map((g) => g.name).join(", ")}
                  </td>
                  <td className="p-3">{movie.duration} phút</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        movie.status === "active"
                          ? "bg-green-900 text-green-400"
                          : movie.status === "upcoming"
                          ? "bg-yellow-900 text-yellow-500"
                          : "bg-neutral-600"
                      }`}
                    >
                      {movie.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEdit(movie.id)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieList;