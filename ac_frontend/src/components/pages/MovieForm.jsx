import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";

const MovieForm = ({ movieId, onBack }) => {
  const isEdit = !!movieId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 120,
    director: "",
    trailerUrl: "",
    posterUrl: "",
    status: "COMING_SOON",
    genreIds: [],
    actorIds: [],
  });

  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resGenres, resActors] = await Promise.all([
          axios.get("http://localhost:8080/api/genres"),
          axios.get("http://localhost:8080/api/actors"),
        ]);

        const gOptions = resGenres.data.map((g) => ({ value: g.id, label: g.name }));
        const aOptions = resActors.data.map((a) => ({ value: a.id, label: a.name }));

        setGenreOptions(gOptions);
        setActorOptions(aOptions);

        if (isEdit) {
          const resMovie = await axios.get(`http://localhost:8080/api/movies/${movieId}`);
          const m = resMovie.data.result;

          setFormData({
            title: m.title,
            description: m.description,
            duration: m.duration,
            director: m.director,
            trailerUrl: m.trailerUrl,
            posterUrl: m.posterUrl,
            status: m.status,
            genreIds: m.genres.map((g) => g.id),
            actorIds: m.actors.map((a) => a.id),
          });

          setSelectedGenres(m.genres.map((g) => ({ value: g.id, label: g.name })));
          setSelectedActors(m.actors.map((a) => ({ value: a.id, label: a.name })));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, [movieId, isEdit]);

  // Xử lý Input thường
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenreChange = (selectedOptions) => {
    setSelectedGenres(selectedOptions);
    setFormData({ 
        ...formData, 
        genreIds: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
    });
  };

  const handleActorChange = (selectedOptions) => {
    setSelectedActors(selectedOptions);
    setFormData({ 
        ...formData, 
        actorIds: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/movies/${movieId}`, formData);
        alert("Cập nhật phim thành công!");
      } else {
        await axios.post("http://localhost:8080/api/movies", formData);
        alert("Thêm phim mới thành công!");
      }
      onBack();
    } catch (error) {
        console.error(error);
        alert("Lỗi lưu phim: " + (error.response?.data?.message || "Lỗi server"));
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#171717', 
      borderColor: '#525252',
      color: 'white',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#262626', 
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#EAB308' : '#262626', 
      color: state.isFocused ? 'black' : 'white',
      cursor: 'pointer'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#404040', 
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white',
    }),
    input: (base) => ({
        ...base,
        color: 'white'
    }),
    singleValue: (base) => ({
        ...base,
        color: 'white'
    })
  };

  return (
    <div className="bg-neutral-800 p-8 rounded-lg border border-neutral-700 max-w-4xl mx-auto shadow-xl">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6">
        {isEdit ? `Chỉnh Sửa Phim` : "Thêm Phim Mới"}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột Trái */}
        <div className="space-y-4">
            <div>
                <label className="text-neutral-400 block mb-1">Tên Phim</label>
                <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none" required />
            </div>
            <div>
                <label className="text-neutral-400 block mb-1">Thời lượng (phút)</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none" required />
            </div>
            <div>
                <label className="text-neutral-400 block mb-1">Đạo diễn</label>
                <input name="director" value={formData.director} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none" />
            </div>
            <div>
                <label className="text-neutral-400 block mb-1">Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none">
                    <option value="active">Sắp Chiếu</option>
                    <option value="upcoming">Đang Chiếu</option>
                    <option value="finished">Ngừng Chiếu</option>
                </select>
            </div>
        </div>

        <div className="space-y-4">
             <div>
                <label className="text-neutral-400 block mb-1">Link Poster</label>
                <input name="posterUrl" value={formData.posterUrl} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none" placeholder="https://..." />
            </div>
             <div>
                <label className="text-neutral-400 block mb-1">Link Trailer</label>
                <input name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none" placeholder="https://..." />
            </div>
            
            <div>
                <label className="text-neutral-400 block mb-1">Thể loại</label>
                <Select
                    isMulti
                    options={genreOptions}
                    value={selectedGenres}
                    onChange={handleGenreChange}
                    styles={customStyles}
                    placeholder="Chọn thể loại..."
                    noOptionsMessage={() => "Không tìm thấy thể loại"}
                />
            </div>

             <div>
                <label className="text-neutral-400 block mb-1">Diễn viên</label>
                <Select
                    isMulti
                    options={actorOptions}
                    value={selectedActors}
                    onChange={handleActorChange}
                    styles={customStyles}
                    placeholder="Gõ tên diễn viên để tìm..."
                    noOptionsMessage={() => "Không tìm thấy diễn viên"}
                />
            </div>
        </div>

        <div className="md:col-span-2">
             <label className="text-neutral-400 block mb-1">Mô tả phim</label>
             <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white h-32 focus:border-yellow-500 outline-none"></textarea>
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">
            <button type="button" onClick={onBack} className="px-6 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-500 font-bold transition-colors">
                Hủy
            </button>
            <button type="submit" className="px-6 py-2 bg-yellow-500 text-neutral-900 rounded hover:bg-yellow-400 font-bold flex-1 transition-colors">
                {isEdit ? "Lưu Thay Đổi" : "Tạo Phim Mới"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;