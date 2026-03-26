import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../api/api';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineViewList,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineTrendingUp,
  HiOutlineCalendar,
  HiOutlineLightningBolt,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineClock,
} from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function AdminHome() {
  const [stats, setStats] = useState({ total_students: 0, total_faculty: 0, total_attendance: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock activity log data
  const [activityLog] = useState([
    { id: 1, action: 'Student Added', user: 'Admin', time: '2 mins ago', icon: 'plus', color: 'blue' },
    { id: 2, action: 'Faculty Updated', user: 'Admin', time: '15 mins ago', icon: 'edit', color: 'green' },
    { id: 3, action: 'Attendance Marked', user: 'Dr. Kumar', time: '45 mins ago', icon: 'check', color: 'emerald' },
    { id: 4, action: 'Report Generated', user: 'Admin', time: '2 hours ago', icon: 'download', color: 'purple' },
    { id: 5, action: 'System Health Check', user: 'System', time: '3 hours ago', icon: 'check', color: 'green' },
  ]);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const systemHealth = [
    { name: 'Database', status: 'Healthy', uptime: '99.9%', color: 'green' },
    { name: 'API Server', status: 'Healthy', uptime: '99.8%', color: 'green' },
    { name: 'Face Recognition', status: 'Healthy', uptime: '99.7%', color: 'green' },
    { name: 'Storage', status: 'Warning', uptime: '85% Used', color: 'yellow' },
  ];

  const statCards = [
    {
      label: 'Total Students',
      value: stats.total_students,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Faculty',
      value: stats.total_faculty,
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      icon: <HiOutlineAcademicCap className="w-8 h-8" />,
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-500',
    },
    {
      label: 'Attendance Records',
      value: stats.total_attendance,
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      icon: <HiOutlineClipboardList className="w-8 h-8" />,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
    },
  ];

  const managementCards = [
    {
      title: 'Students',
      description: 'Manage student profiles, registrations, and academic details',
      gradient: 'from-blue-600 to-cyan-600',
      hoverGradient: 'hover:from-blue-700 hover:to-cyan-700',
      icon: <HiOutlineUserGroup className="w-12 h-12" />,
      actions: [
        { to: '/admin/add-student', label: 'Add New Student', icon: <HiOutlinePlusCircle className="w-5 h-5" /> },
        { to: '/admin/students', label: 'View All Students', icon: <HiOutlineViewList className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Faculty',
      description: 'Manage faculty members, UIDs, and system access',
      gradient: 'from-emerald-600 to-green-600',
      hoverGradient: 'hover:from-emerald-700 hover:to-green-700',
      icon: <HiOutlineAcademicCap className="w-12 h-12" />,
      actions: [
        { to: '/admin/add-faculty', label: 'Add New Faculty', icon: <HiOutlinePlusCircle className="w-5 h-5" /> },
        { to: '/admin/faculty', label: 'View All Faculty', icon: <HiOutlineViewList className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Attendance',
      description: 'Monitor, search, and analyze attendance records across all classes',
      gradient: 'from-amber-500 to-orange-500',
      hoverGradient: 'hover:from-amber-600 hover:to-orange-600',
      icon: <HiOutlineClipboardList className="w-12 h-12" />,
      actions: [
        { to: '/admin/attendance', label: 'View Records', icon: <HiOutlineEye className="w-5 h-5" /> },
        { to: '/admin/attendance', label: 'Search Attendance', icon: <HiOutlineSearch className="w-5 h-5" /> },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-indigo-100 max-w-xl">
                  Complete control center for managing students, faculty, and AI-powered attendance system with real-time analytics
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 mt-6 flex-wrap"
              >
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <HiOutlineLightningBolt className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <HiOutlineCalendar className="w-5 h-5 text-green-300" />
                  <span className="text-sm font-medium">Real-time Tracking</span>
                </div>
                <button
                  onClick={fetchStats}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <HiOutlineRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <HiOutlineClipboardList className="w-20 h-20 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl blur"></div>
            <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-4xl font-bold text-gray-800 mt-2"
                  >
                    {stat.value.toLocaleString()}
                  </motion.h3>
                  <div className="flex items-center gap-1 mt-2 text-green-600">
                    <HiOutlineTrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Active & Growing</span>
                  </div>
                </div>
                
                <div className={`${stat.bg} rounded-2xl p-4`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            System Health
          </h3>
          <div className="space-y-4">
            {systemHealth.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.status}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold text-${item.color}-600`}>{item.uptime}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5 text-indigo-600" />
            Recent Activity Log
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activityLog.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-indigo-500"
              >
                <div className={`w-10 h-10 bg-${log.color}-100 rounded-lg flex items-center justify-center`}>
                  <HiOutlineCheckCircle className={`w-5 h-5 text-${log.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{log.action}</p>
                  <p className="text-xs text-gray-500">by {log.user}</p>
                </div>
                <span className="text-xs text-gray-500">{log.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Management Cards */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"
        >
          <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
          Quick Management
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managementCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${card.gradient} ${card.hoverGradient} p-6 text-white transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold">{card.title}</h3>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              
              {/* Card Actions */}
              <div className="p-6 space-y-3">
                {card.actions.map((action, actionIndex) => (
                  <Link
                    key={actionIndex}
                    to={action.to}
                    className="group/action flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <div className={`rounded-xl p-2 mr-4 transition-all duration-200 ${card.bg}`}>
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-700 group-hover/action:text-gray-900">
                      {action.label}
                    </span>
                    <div className="ml-auto opacity-0 group-hover/action:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-500/20 rounded-xl p-3">
              <HiOutlineDownload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">Export Reports</h3>
              <p className="text-sm text-gray-600">Generate and download attendance reports in CSV or PDF format</p>
            </div>
          </div>
          <Link to="/admin/attendance" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm">
            Generate Report →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border border-purple-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500/20 rounded-xl p-3">
              <HiOutlineExclamation className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">Update Security</h3>
              <p className="text-sm text-gray-600">Review and update admin security policies and access controls</p>
            </div>
          </div>
          <button className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm">
            Review Settings →
          </button>
        </div>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="bg-yellow-400/20 rounded-xl p-3 flex-shrink-0">
            <HiOutlineLightningBolt className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-3">💡 Pro Tips for Efficient Management</h3>
            <ul className="text-sm text-slate-300 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <li>✓ Enable auto-refresh (every 30 seconds) for real-time updates</li>
              <li>✓ Use bulk operations for faster student/faculty updates</li>
              <li>✓ Search by ID for instant record lookup</li>
              <li>✓ Monitor system health regularly for optimal performance</li>
              <li>✓ Export reports monthly for compliance</li>
              <li>✓ Review activity logs for audit trail purposes</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
