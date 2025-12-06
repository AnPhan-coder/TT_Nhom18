import React, { useState, useEffect, useRef } from "react";
import { Search, User, LogOut, Menu, X, ChevronDown, UserCircle, LayoutDashboard } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateAuthStatus = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    updateAuthStatus();
    window.addEventListener("auth-change", updateAuthStatus);
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";
  const getAvatarLetter = (name) => (name ? name.charAt(0).toUpperCase() : "U");
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            AN<span>CINEMA</span>
          </Link>
        </div>

        <nav
          className={`nav-menu ${
            isMobileMenuOpen
              ? "flex flex-col absolute top-20 left-0 w-full bg-neutral-900 p-8 border-b border-neutral-700 z-50"
              : "hidden md:flex"
          }`}
        >
          <Link
            to="/"
            className={isActive("/")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Trang chủ
          </Link>
          <a
            href="/#lich-chieu"
            className="nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Lịch chiếu
          </a>
          <a
            href="/#phim"
            className="nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Phim
          </a>
          <a
            href="/#lien-he"
            className="nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Liên Hệ
          </a>

          <div
            className="md:hidden absolute top-4 right-4 cursor-pointer text-neutral-400"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </div>
        </nav>

        <div className="header-actions">
          <div className="search-box hidden md:flex">
            <input type="text" placeholder="Tìm phim..." />
            <button>
              <Search size={18} />
            </button>
          </div>

          {user ? (
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-neutral-900 font-bold text-sm">
                  {getAvatarLetter(user.name || user.username)}
                </div>
                <span className="text-sm font-semibold text-neutral-200 hidden lg:block max-w-[100px] truncate">
                  {user.name || user.username || "Khách"}
                </span>
                <ChevronDown size={16} className="text-neutral-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-700">
                    <p className="text-sm text-white font-bold truncate">
                      {user.name || user.username}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {user.role || "Member"}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-yellow-500 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <UserCircle size={18} />
                    Hồ sơ của tôi
                  </Link>

                  {user.role && user.role.toUpperCase() === "ADMIN" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-yellow-500 font-bold hover:bg-neutral-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboard size={18} />
                      Trang Quản Trị
                    </Link>
                  )}

                  <div className="border-t border-neutral-700 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-login flex items-center gap-2 ml-4"
              onClick={() => navigate("/login")}
            >
              <User size={18} />
              <span>Đăng nhập</span>
            </button>
          )}
          <div className="md:hidden cursor-pointer text-neutral-200 ml-4" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
