import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [activeMovies, setActiveMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
       axios
      .get("http://localhost:8080/api/movies")
      .then((response) => {
        const data = response.data;
        setMovies(data);
        setActiveMovies(data.filter((m) => m.status === "active"));
        setUpcomingMovies(data.filter((m) => m.status === "upcoming"));
      })
      .catch((error) => console.error("Lỗi gọi API:", error));
  }, []);


  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  const listSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4, // Hiện 4 phim 1 hàng
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  //render card 
  const renderMovieCard = (movie, type) => (
    <div key={movie.id} className="px-3 py-4 h-full"> 
      <div className="movie-card h-full flex flex-col">
        <div 
            className="poster-wrapper relative"
            style={{cursor: 'pointer'}}
            onClick={() => !isDragging && type === 'active' && navigate(`/movie/${movie.id}`)}
        >
            <img
            src={movie.posterUrl}
            alt={movie.title}
            className="card-poster block w-full object-cover"
            onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
            }}
            />
        </div>
        <div className="card-content flex-grow flex flex-col justify-between">
          <h3 className="card-title mt-2" title={movie.title}>{movie.title}</h3>
          <p className="card-genre text-sm text-gray-400 mb-3">{movie.genre}</p>
          
          {type === "active" ? (
            <button
              className="btn-action btn-buy mt-auto"
              onClick={(e) => { e.stopPropagation();if (!isDragging) navigate(`/movie/${movie.id}`); }}
            >
              MUA VÉ
            </button>
          ) : (
            <button className="btn-action btn-upcoming mt-auto">
              SẮP CHIẾU
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <section className="banner-section">
        {activeMovies.length > 0 && (
            <Slider {...bannerSettings}>
                {activeMovies.slice(0, 5).map(movie => (
                    <div key={movie.id} className="banner-item" onClick={() => navigate(`/movie/${movie.id}`)}>
                        <div className="banner-content">
                            <div className="banner-bg" style={{backgroundImage: `url(${movie.posterUrl})`}}></div>
                            <img src={movie.posterUrl} alt={movie.title} className="banner-poster" />
                            <div className="banner-info">
                                <h2 className="banner-title">{movie.title}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        )}
      </section>

      <section className="movie-section container mx-auto px-4" id="phim-dang-chieu">
        <div className="section-header">
            <h2 className="section-title">Phim Đang Chiếu</h2>
        </div>
        <div className="-mx-3"> 
            <Slider {...listSettings}>
                {activeMovies.map(movie => renderMovieCard(movie, "active"))}
            </Slider>
        </div>
      </section>

      <section className="movie-section container mx-auto px-4" id="phim-sap-chieu">
        <div className="section-header">
            <h2 className="section-title">Phim Sắp Chiếu</h2>
        </div>
        {upcomingMovies.length > 0 ? (
            <div className="-mx-3">
                <Slider {...listSettings}>
                    {upcomingMovies.map(movie => renderMovieCard(movie, "upcoming"))}
                </Slider>
            </div>
        ) : (
            <p className="text-center text-neutral-500 py-8">Chưa có phim sắp chiếu.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;