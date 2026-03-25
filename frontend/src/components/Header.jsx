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
  HiOutlineChevronDown,
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const dashLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'faculty') return '/faculty/dashboard';
    if (user.role === 'student') return '/student/dashboard';
    return '/';
  };

  const getRoleConfig = () => {
    if (!user) return null;
    if (user.role === 'admin') return {
      color: 'from-purple-500 to-pink-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      label: 'Admin',
      icon: '👑',
      outlineIcon: <HiOutlineOfficeBuilding className="w-5 h-5" />
    };
    if (user.role === 'faculty') return {
      color: 'from-green-500 to-emerald-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      label: 'Faculty',
      icon: '👨‍🏫',
      outlineIcon: <HiOutlineAcademicCap className="w-5 h-5" />
    };
    if (user.role === 'student') return {
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      label: 'Student',
      icon: '🎓',
      outlineIcon: <HiOutlineUser className="w-5 h-5" />
    };
    return null;
  };

  const roleConfig = getRoleConfig();

  const adminMenuItems = [
    { to: '/admin', label: 'Dashboard', icon: <HiOutlineViewGrid className="w-4 h-4" /> },
    { to: '/admin/students', label: 'Students', icon: <HiOutlineUserGroup className="w-4 h-4" /> },
    { to: '/admin/faculty', label: 'Faculty', icon: <HiOutlineAcademicCap className="w-4 h-4" /> },
    { to: '/admin/attendance', label: 'Attendance', icon: <HiOutlineClipboardList className="w-4 h-4" /> },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link to={dashLink()} className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105 group-hover:rotate-3">
              <svg className="w-6 h-6 text-white" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.12" />
                <path d="M12 34L24 14L36 34H12Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                Digital ID
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">AI Attendance System</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to={dashLink()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    roleConfig?.lightColor || 'bg-gray-50'
                  } ${roleConfig?.textColor || 'text-gray-600'} hover:shadow-md`}
                >
                  {roleConfig?.outlineIcon}
                  <span>{roleConfig?.label} Dashboard</span>
                </Link>

                {/* Admin Menu Dropdown */}
                {user.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <HiOutlineCog className="w-4 h-4" />
                      <span>Manage</span>
                      <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-scale-in">
                          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                            <p className="text-xs font-semibold text-gray-600">Admin Panel</p>
                            <p className="text-xs text-gray-500">Manage system</p>
                          </div>
                          {adminMenuItems.map((item, i) => (
                            <Link
                              key={i}
                              to={item.to}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all border-b border-gray-50 last:border-b-0"
                            >
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                {item.icon}
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.first_name || user.username}
                  </span>
                </div>

                {/* Role Badge */}
                {roleConfig && (
                  <div className={`hidden lg:flex bg-gradient-to-r ${roleConfig.color} text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg`}>
                    <span>{roleConfig.icon}</span>
                    <span>{roleConfig.label}</span>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-105"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all"
                >
                  <HiOutlineHome className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:scale-105"
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
            className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 px-2 space-y-2 animate-slide-in">
            {user ? (
              <>
                {/* Role Badge Mobile */}
                {roleConfig && (
                  <div className={`mx-2 mb-3 bg-gradient-to-r ${roleConfig.color} text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2`}>
                    <span>{roleConfig.icon}</span>
                    <span>{roleConfig.label} Access</span>
                  </div>
                )}

                {/* User Info Mobile */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mx-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {user.first_name || user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email || 'Logged in'}
                    </p>
                  </div>
                </div>

                {/* Dashboard Link Mobile */}
                <Link
                  to={dashLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    roleConfig?.lightColor || 'bg-gray-50'
                  } ${roleConfig?.textColor || 'text-gray-600'}`}
                >
                  {roleConfig?.outlineIcon}
                  <span>Go to Dashboard</span>
                </Link>

                {/* Admin Menu Mobile */}
                {user.role === 'admin' && adminMenuItems.map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Logout Mobile */}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold rounded-xl mt-3"
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <HiOutlineHome className="w-5 h-5" />
                  Home
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl mt-2"
                >
                  <HiOutlineLogin className="w-5 h-5" />
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
