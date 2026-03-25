import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineLogin,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'faculty') return '/faculty/dashboard';
    if (user.role === 'student') return '/student/dashboard';
    return '/';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'admin') return { color: 'from-purple-500 to-pink-500', label: 'Admin', icon: '👑' };
    if (user.role === 'faculty') return { color: 'from-green-500 to-emerald-500', label: 'Faculty', icon: '👨‍🏫' };
    if (user.role === 'student') return { color: 'from-blue-500 to-cyan-500', label: 'Student', icon: '🎓' };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link to={dashLink()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105">
              <svg className="w-6 h-6 text-white" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.12" />
                <path d="M12 34L24 14L36 34H12Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                Digital ID Attendance
              </h1>
              <p className="text-xs text-gray-500 -mt-1">AI-Powered System</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Role Badge */}
                {roleBadge && (
                  <div className={`bg-gradient-to-r ${roleBadge.color} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md`}>
                    <span>{roleBadge.icon}</span>
                    <span>{roleBadge.label}</span>
                  </div>
                )}

                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.first_name || user.username}
                  </span>
                </div>

                {/* Navigation Links */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <HiOutlineCog className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {user.role === 'faculty' && (
                  <Link
                    to="/faculty/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                  >
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {user.role === 'student' && (
                  <Link
                    to="/student/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <HiOutlineUser className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <HiOutlineHome className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <HiOutlineLogin className="w-4 h-4" />
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            {user ? (
              <>
                {roleBadge && (
                  <div className={`bg-gradient-to-r ${roleBadge.color} text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mx-2`}>
                    <span>{roleBadge.icon}</span>
                    <span>{roleBadge.label}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mx-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.first_name || user.username}
                  </span>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold rounded-xl mx-2"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl mx-2"
                >
                  <HiOutlineHome className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl mx-2"
                >
                  <HiOutlineLogin className="w-4 h-4" />
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
