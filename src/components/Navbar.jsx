import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Who we are', path: '/who-we-are' },
    { name: 'Streamify', path: '/streamify' },
    { name: 'Blog', path: '/blog' },
    { name: 'Resources', path: '/resources' }
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-black bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 bg-clip-text text-transparent hover:scale-110 transition-transform">
            CELVZ
          </Link>

          <div className="hidden md:flex space-x-8">
            {links.map(link => (
              <Link key={link.path} to={link.path} 
                className="text-gray-700 hover:text-teal-600 transition-all duration-300 font-semibold relative group">
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-teal-600 text-3xl">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4 animate-fade-in">
            {links.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                className="block text-gray-700 hover:text-teal-600 transition-all font-semibold text-lg">
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;