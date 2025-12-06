import React from 'react';
import { Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          
          <div className="footer-col">
            <h3>AN<span>CINEMA</span></h3>
            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
              Chào mừng bạn đến với bình nguyên vô tận
            </p>
            <div className="social-links mt-6">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Điều khoản</h4>
            <ul>
              <li><a href="#">Điều khoản chung</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Liên hệ</h4>
            <div className="flex flex-col gap-2 text-sm text-neutral-500">
              <p><span className="text-neutral-300 font-medium">Hotline:</span> 52200311</p>
              <p><span className="text-neutral-300 font-medium">Email:</span> dh52200311@student.stu.edu.vn</p>
              <p><span className="text-neutral-300 font-medium">Địa chỉ:</span> 180 Cao Lỗ, Q8, TP.HCM</p>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 AN CINEMA. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;