import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-gutter">
        <NavLink to="/" className="font-h2 text-h2 font-bold text-primary">ExpertHive</NavLink>
        <div className="hidden md:flex items-center gap-lg ml-xl">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `font-body-md text-body-md ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors duration-200`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/experts"
            className={({ isActive }) =>
              `font-body-md text-body-md ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors duration-200`
            }
          >
            Explore Experts
          </NavLink>
          <NavLink
            to="/apply-expert"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            Become an Expert
          </NavLink>
          {user && (
            <NavLink
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className={({ isActive }) =>
                `font-body-md text-body-md ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors duration-200`
              }
            >
              Dashboard
            </NavLink>
          )}
        </div>
      </div>

      <div className="flex items-center gap-md">

        {user ? (
          <div className="hidden sm:flex items-center gap-sm">
            <Link to="/profile" className="font-label-md text-on-surface hover:text-primary hover:underline cursor-pointer">
              Hi, {user.name}
            </Link>
            <button onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            }} className="font-label-md text-label-md text-error bg-error-container hover:bg-[#ffd0cb] transition-colors px-4 py-2 rounded-lg">Logout</button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="font-label-md text-label-md text-primary bg-secondary-container hover:bg-secondary-fixed transition-colors px-4 py-2 rounded-lg hidden sm:block">Login/Register</button>
        )}

        <button className="md:hidden text-on-surface p-2" onClick={toggleMenu}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-surface-container-lowest border-b border-outline-variant shadow-lg flex flex-col p-4 md:hidden"
          >
            <Link to="/" onClick={toggleMenu} className="py-3 border-b border-outline-variant font-body-md text-on-surface">Home</Link>
            <Link to="/experts" onClick={toggleMenu} className="py-3 border-b border-outline-variant font-body-md text-on-surface">Find Experts</Link>
            {user && (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={toggleMenu} className="py-3 border-b border-outline-variant font-body-md text-on-surface">Dashboard</Link>
            )}
            <div className="py-4 flex justify-center">
              {user ? (
                <button onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    toggleMenu();
                  }
                }} className="w-full font-label-md text-error bg-error-container px-4 py-2 rounded-lg">Logout</button>
              ) : (
                <button onClick={() => { navigate('/login'); toggleMenu(); }} className="w-full font-label-md text-primary bg-secondary-container px-4 py-2 rounded-lg">Login/Register</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
