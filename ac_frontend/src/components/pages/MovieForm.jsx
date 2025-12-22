import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react"; 

const MovieForm = ({ movieId, onBack }) => {
  const isEdit = !!movieId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 120,
    director: "",
    trailerUrl: "",
    posterUrl: "",
    status: "upcoming",
    genreIds: [],
    actorIds: [],
  });

  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);

  const [posterMode, setPosterMode] = useState("URL"); 
  const [uploading, setUploading] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resGenres, resActors] = await Promise.all([
          axiosClient.get("/genres"),
          axiosClient.get("/actors"),
        ]);

        const gOptions = resGenres.data.map((g) => ({
          value: g.id,
          label: g.name,
        }));
        const aOptions = resActors.data.map((a) => ({
          value: a.id,
          label: a.name,
        }));

        setGenreOptions(gOptions);
        setActorOptions(aOptions);

        if (isEdit) {
          const resMovie = await axiosClient.get(`/movies/${movieId}`);
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

          setSelectedGenres(
            m.genres.map((g) => ({ value: g.id, label: g.name }))
          );
          setSelectedActors(
            m.actors.map((a) => ({ value: a.id, label: a.name }))
          );
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, [movieId, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCreateGenre = async (inputValue) => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/genres", {
        name: inputValue,
      });
      const newGenre = res.data;
      const newOption = { value: newGenre.id, label: newGenre.name };

      setGenreOptions((prev) => [...prev, newOption]);
      setSelectedGenres((prev) => [...prev, newOption]);
      setFormData((prev) => ({
        ...prev,
        genreIds: [...prev.genreIds, newGenre.id],
      }));

      toast.success(`✨ Đã thêm thể loại mới: ${newGenre.name}`);
    } catch (error) {
      toast.error("Lỗi tạo thể loại");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateActor = async (inputValue) => {
    setLoading(true);
    try {
     const res = await axiosClient.post("/actors", {
        name: inputValue,
      });
      const newActor = res.data;
      const newOption = { value: newActor.id, label: newActor.name };

      setActorOptions((prev) => [...prev, newOption]);
      setSelectedActors((prev) => [...prev, newOption]);
      setFormData((prev) => ({
        ...prev,
        actorIds: [...prev.actorIds, newActor.id],
      }));

      toast.success(`✨ Đã thêm diễn viên mới: ${newActor.name}`);
    } catch (error) {
      toast.error("Lỗi tạo diễn viên");
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (selectedOptions) => {
    setSelectedGenres(selectedOptions);
    setFormData({
      ...formData,
      genreIds: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleActorChange = (selectedOptions) => {
    setSelectedActors(selectedOptions);
    setFormData({
      ...formData,
      actorIds: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };
const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh (jpg, png...)");
        return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setUploading(true);
    try {
        const res = await axiosClient.post("/upload", formDataUpload, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        const imageUrl = res.result || res.data?.result;

        if (imageUrl) {
            setFormData(prev => ({ ...prev, posterUrl: imageUrl }));
            toast.success("Đã tải ảnh lên thành công!");
        } else {
            console.log("Response upload:", res); 
        }
    } catch (error) {
        console.error(error);
        toast.error("Lỗi upload ảnh: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
        setUploading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (isEdit) {
            await axiosClient.put(`/movies/${movieId}`, formData);
            toast.success("Cập nhật phim thành công!");
        } else {
            await axiosClient.post("/movies", formData);
            toast.success("Thêm phim mới thành công!");
        }
        onBack();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi lưu phim: " + (error.response?.data?.message || "Lỗi server"));
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#171717",
      borderColor: "#525252",
      color: "white",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#262626",
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#EAB308" : "#262626",
      color: state.isFocused ? "black" : "white",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#404040",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
    }),
    input: (base) => ({
      ...base,
      color: "white",
    }),
    singleValue: (base) => ({
      ...base,
      color: "white",
    }),
  };

  return (
    <div className="bg-neutral-800 p-8 rounded-lg border border-neutral-700 max-w-4xl mx-auto shadow-xl">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6">
        {isEdit ? `Chỉnh Sửa Phim` : "Thêm Phim Mới"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-4">
          <div>
            <label className="text-neutral-400 block mb-1">Tên Phim</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">
              Thời lượng (phút)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">Đạo diễn</label>
            <input
              name="director"
              value={formData.director}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
            >
              <option value="upcoming">Sắp Chiếu</option>
              <option value="active">Đang Chiếu</option>
              <option value="finished">Ngừng Chiếu</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          
          <div>
            <label className="text-neutral-400 block mb-1">Poster Phim</label>
            
            <div className="flex gap-2 mb-2 text-sm">
                <button 
                    type="button"
                    onClick={() => setPosterMode("URL")}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${posterMode === 'URL' ? 'bg-yellow-500 text-black font-bold' : 'bg-neutral-700 text-neutral-400'}`}
                >
                    <LinkIcon size={14}/> Link URL
                </button>
                <button 
                    type="button"
                    onClick={() => setPosterMode("FILE")}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${posterMode === 'FILE' ? 'bg-yellow-500 text-black font-bold' : 'bg-neutral-700 text-neutral-400'}`}
                >
                    <Upload size={14}/> Tải ảnh lên
                </button>
            </div>

            {posterMode === "URL" ? (
                <input
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
                  placeholder="https://..."
                />
            ) : (
                <div className="border border-dashed border-neutral-600 rounded p-4 text-center hover:bg-neutral-900 transition-colors relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center text-neutral-400">
                        {uploading ? (
                            <span>Đang tải lên...</span>
                        ) : (
                            <>
                                <Upload size={24} className="mb-2"/>
                                <span className="text-sm">Chọn ảnh từ máy</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {formData.posterUrl && (
                <div className="mt-2 relative group w-24 h-36 border border-neutral-700 rounded overflow-hidden">
                    <img src={formData.posterUrl} alt="Preview" className="w-full h-full object-cover"/>
                </div>
            )}
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">Link Trailer</label>
            <input
              name="trailerUrl"
              value={formData.trailerUrl}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white focus:border-yellow-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">
              Thể loại
            </label>
            <CreatableSelect
              isMulti
              options={genreOptions}
              value={selectedGenres}
              onChange={handleGenreChange}
              onCreateOption={handleCreateGenre}
              styles={customStyles}
              placeholder="Chọn hoặc gõ tên thể loại mới..."
              formatCreateLabel={(inputValue) => `Tạo mới: "${inputValue}"`}
              isDisabled={loading}
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">
              Diễn viên
            </label>
            <CreatableSelect
              isMulti
              options={actorOptions}
              value={selectedActors}
              onChange={handleActorChange}
              onCreateOption={handleCreateActor} 
              styles={customStyles}
              placeholder="Chọn hoặc gõ tên diễn viên mới..."
              formatCreateLabel={(inputValue) => `Tạo mới: "${inputValue}"`}
              isDisabled={loading}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-neutral-400 block mb-1">Mô tả phim</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-neutral-900 border border-neutral-600 p-2 rounded text-white h-32 focus:border-yellow-500 outline-none"
          ></textarea>
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-500 font-bold transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-yellow-500 text-neutral-900 rounded hover:bg-yellow-400 font-bold flex-1 transition-colors"
          >
            {isEdit ? "Lưu Thay Đổi" : "Tạo Phim Mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;