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
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineClock,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  StatCard,
} from '../components/ui';
import { SkeletonCard, SkeletonText } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

export default function AdminHomePremium() {
  const [stats, setStats] = useState({ total_students: 0, total_faculty: 0, total_attendance: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Mock activity log data
  const [activityLog] = useState([
    { id: 1, action: 'Student Added', user: 'Admin', time: '2 mins ago', variant: 'success' },
    { id: 2, action: 'Faculty Updated', user: 'Admin', time: '15 mins ago', variant: 'info' },
    { id: 3, action: 'Attendance Marked', user: 'Dr. Kumar', time: '45 mins ago', variant: 'success' },
    { id: 4, action: 'Report Generated', user: 'Admin', time: '2 hours ago', variant: 'info' },
    { id: 5, action: 'System Health Check', user: 'System', time: '3 hours ago', variant: 'success' },
  ]);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const response = await getAdminStats();
      setStats(response.data);
      toast.success('Dashboard refreshed', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to fetch stats');
      console.error('Error fetching stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchStats();
      setLoading(false);
    };

    loadInitialData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const systemHealth = [
    { name: 'Database', status: 'Healthy', uptime: '99.9%', statusColor: 'green' },
    { name: 'API Server', status: 'Healthy', uptime: '99.8%', statusColor: 'green' },
    { name: 'Face Recognition', status: 'Healthy', uptime: '99.7%', statusColor: 'green' },
    { name: 'Storage', status: 'Warning', uptime: '85% Used', statusColor: 'yellow' },
  ];

  const managementSections = [
    {
      title: 'Students',
      icon: HiOutlineUserGroup,
      description: 'Manage student profiles and registrations',
      color: 'blue',
      actions: [
        { label: 'Add New Student', icon: HiOutlinePlusCircle, to: '/admin/add-student' },
        { label: 'View All Students', icon: HiOutlineViewList, to: '/admin/students' },
      ],
    },
    {
      title: 'Faculty',
      icon: HiOutlineAcademicCap,
      description: 'Manage faculty members and access',
      color: 'green',
      actions: [
        { label: 'Add New Faculty', icon: HiOutlinePlusCircle, to: '/admin/add-faculty' },
        { label: 'View All Faculty', icon: HiOutlineViewList, to: '/admin/faculty' },
      ],
    },
    {
      title: 'Attendance',
      icon: HiOutlineClipboardList,
      description: 'Monitor and analyze attendance records',
      color: 'amber',
      actions: [
        { label: 'View Records', icon: HiOutlineEye, to: '/admin/attendance' },
        { label: 'Search Attendance', icon: HiOutlineSearch, to: '/admin/attendance' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonCard lines={3} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} elevation="md">
              <SkeletonText lines={2} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const colorMap = {
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-emerald-600 to-green-600',
    amber: 'from-amber-600 to-orange-600',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Admin Dashboard</h1>
            <p className="text-lg text-indigo-100 max-w-xl">
              Complete control center for managing students, faculty, and AI-powered attendance system
            </p>

            <div className="flex gap-3 mt-6 flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <HiOutlineLightningBolt className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <HiOutlineCalendar className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium">Real-time Tracking</span>
              </div>
              <Button
                onClick={fetchStats}
                disabled={refreshing}
                variant="ghost"
                size="sm"
                icon={HiOutlineRefresh}
                className="!text-white hover:!bg-white/20"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          <div className="text-5xl md:text-7xl font-bold text-white opacity-10">
            {stats.total_students + stats.total_faculty}
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={stats.total_students}
          icon={HiOutlineUserGroup}
          description="Active students in system"
          trendPositive={true}
        />
        <StatCard
          title="Total Faculty"
          value={stats.total_faculty}
          icon={HiOutlineAcademicCap}
          description="Faculty members"
          trendPositive={true}
        />
        <StatCard
          title="Attendance Records"
          value={stats.total_attendance}
          icon={HiOutlineClipboardList}
          description="Total records"
          trendPositive={true}
        />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {managementSections.map((section, idx) => {
          const Icon = section.icon;
          const gradient = colorMap[section.color];

          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card elevation="lg" hoverable interactive className="h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} p-2.5 mb-3`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Link
                          key={action.label}
                          to={action.to}
                          className="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                        >
                          <ActionIcon className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">
                            {action.label}
                          </span>
                          <HiOutlineArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* System Health & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card elevation="lg" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineLightningBolt className="w-5 h-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.map((system) => (
                <div key={system.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{system.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{system.uptime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        system.statusColor === 'green'
                          ? 'bg-green-500'
                          : system.statusColor === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      } animate-pulse`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        system.statusColor === 'green'
                          ? 'text-green-700 dark:text-green-300'
                          : system.statusColor === 'yellow'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {system.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card elevation="lg" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineCheckCircle className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      activity.variant === 'success'
                        ? 'bg-green-500'
                        : activity.variant === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card elevation="lg" padding="lg" className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/add-student">
              <Button variant="outline" fullWidth icon={HiOutlinePlusCircle} size="sm">
                Add Student
              </Button>
            </Link>
            <Link to="/admin/add-faculty">
              <Button variant="outline" fullWidth icon={HiOutlinePlusCircle} size="sm">
                Add Faculty
              </Button>
            </Link>
            <Link to="/admin/attendance">
              <Button variant="outline" fullWidth icon={HiOutlineSearch} size="sm">
                Search Records
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" fullWidth icon={HiOutlineTrendingUp} size="sm">
                View Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
