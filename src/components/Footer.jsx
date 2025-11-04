import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-teal-900 to-teal-700 text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-3xl font-black mb-4">CELVZ</h3>
            <p className="text-teal-100">Youth Church Raising Champions</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-teal-100">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/who-we-are" className="hover:text-white transition">Who we are</Link></li>
              <li><Link to="/streamify" className="hover:text-white transition">Streamify</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-teal-100">Oregun, Ikeja, Lagos</p>
            <p className="text-teal-100">info@celvz.org</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="bg-teal-600 p-2 rounded-full hover:bg-teal-500 transition">f</a>
              <a href="#" className="bg-teal-600 p-2 rounded-full hover:bg-teal-500 transition">𝕏</a>
              <a href="#" className="bg-teal-600 p-2 rounded-full hover:bg-teal-500 transition">📷</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-teal-600 mt-8 pt-8 text-center text-teal-100">
          <Link to="/admin" className="hover:text-white transition">
            © 2025 CELVZ Youth Church. All rights reserved.
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;