import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineExclamation,
  HiOutlineClock,
  HiOutlineDownload,
} from 'react-icons/hi';
import { MainLayout } from '../components/layout';
import { Button, Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui';
import { KPICard, AlertsList, FilterBar, MetricCard } from '../components/dashboard';
import { getAdminStats } from '../api/api';
import { useToast } from '../context/ToastContext';

const AdminDashboardModern = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_faculty: 0,
    total_attendance: 0,
    active_sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});
  const { toast } = useToast();

  // Fetch admin stats
  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const response = await getAdminStats();
      setStats(response.data);
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Mock data for alerts
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Low Attendance Alert',
      message: '15 students have attendance below 75%. Immediate action recommended.',
      action: { label: 'View Students' },
    },
    {
      id: 2,
      type: 'info',
      title: 'System Update',
      message: 'Weekly data sync completed successfully. All records updated.',
    },
    {
      id: 3,
      type: 'warning',
      title: 'Inactive Faculty',
      message: '3 faculty members have not marked attendance in the last 7 days.',
      action: { label: 'View List' },
    },
  ];

  // Filter configuration
  const filterConfig = [
    {
      id: 'branch',
      label: 'Branch',
      type: 'select',
      placeholder: 'Select branch',
      options: [
        { value: 'cse', label: 'Computer Science' },
        { value: 'ece', label: 'Electronics' },
        { value: 'me', label: 'Mechanical' },
      ],
    },
    {
      id: 'year',
      label: 'Year',
      type: 'select',
      placeholder: 'Select year',
      options: [
        { value: '1', label: '1st Year' },
        { value: '2', label: '2nd Year' },
        { value: '3', label: '3rd Year' },
        { value: '4', label: '4th Year' },
      ],
    },
    {
      id: 'date_from',
      label: 'From Date',
      type: 'date',
    },
    {
      id: 'date_to',
      label: 'To Date',
      type: 'date',
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: HiOutlinePlusCircle,
      label: 'Add Student',
      description: 'Register new student',
      color: 'blue',
    },
    {
      icon: HiOutlinePlusCircle,
      label: 'Add Faculty',
      description: 'Register new faculty member',
      color: 'green',
    },
    {
      icon: HiOutlineDownload,
      label: 'Export Report',
      description: 'Generate attendance report',
      color: 'purple',
    },
    {
      icon: HiOutlineChartBar,
      label: 'Analytics',
      description: 'View detailed analytics',
      color: 'orange',
    },
  ];

  // System health
  const systemHealth = [
    { name: 'Database', status: 'healthy', uptime: '99.9%' },
    { name: 'API Server', status: 'healthy', uptime: '99.8%' },
    { name: 'Face Recognition', status: 'healthy', uptime: '99.7%' },
    { name: 'Storage', status: 'warning', uptime: '85% Used' },
  ];

  // Activity log data
  const activityLog = [
    { id: 1, action: 'Student Registration', user: 'Admin', time: '2 mins ago', icon: HiOutlineUserGroup },
    { id: 2, action: 'Faculty Updated', user: 'Admin', time: '15 mins ago', icon: HiOutlineAcademicCap },
    { id: 3, action: 'Attendance Marked', user: 'Dr. Kumar', time: '45 mins ago', icon: HiOutlineChartBar },
    { id: 4, action: 'Report Generated', user: 'Admin', time: '2 hours ago', icon: HiOutlineDownload },
    { id: 5, action: 'System Health Check', user: 'System', time: '3 hours ago', icon: HiOutlineClock },
  ];

  return (
    <MainLayout
      pageTitle="Admin Dashboard"
      onRefresh={fetchStats}
      isRefreshing={refreshing}
    >
      {/* KPI Summary Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={HiOutlineUserGroup}
          label="Total Students"
          value={stats.total_students}
          change={5}
          changeType="positive"
          color="blue"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineAcademicCap}
          label="Total Faculty"
          value={stats.total_faculty}
          change={2}
          changeType="positive"
          color="green"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineChartBar}
          label="Attendance Rate"
          value={`${stats.total_attendance}%`}
          change={3}
          changeType="positive"
          color="purple"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineClock}
          label="Active Sessions"
          value={stats.active_sessions}
          change={8}
          changeType="positive"
          color="orange"
          loading={loading}
        />
      </section>

      {/* Alerts Section */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h2>
        </div>
        <AlertsList alerts={alerts} />
      </section>

      {/* Filters */}
      <section className="mb-8">
        <FilterBar filters={filterConfig} onFilter={setFilters} />
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            const colorMap = {
              blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 hover:border-blue-400',
              green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 hover:border-green-400',
              purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 hover:border-purple-400',
              orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 hover:border-orange-400',
            };

            return (
              <motion.button
                key={idx}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-br ${colorMap[action.color]} border rounded-lg p-6 text-left transition-all hover:shadow-lg`}
              >
                <Icon size={24} className="mb-3 opacity-60" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{action.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* System Health & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uptime: {item.uptime}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'healthy'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {item.status === 'healthy' ? 'Healthy' : 'Warning'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Activity Log */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mt-0.5">
                        <ActivityIcon size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{activity.time}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Management Sections */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          {
            title: 'Student Management',
            icon: HiOutlineUserGroup,
            color: 'blue',
            stats: '1,234 Students',
            actions: ['View All', 'Add New'],
          },
          {
            title: 'Faculty Management',
            icon: HiOutlineAcademicCap,
            color: 'green',
            stats: '45 Faculty Members',
            actions: ['View All', 'Add New'],
          },
          {
            title: 'Attendance Reports',
            icon: HiOutlineChartBar,
            color: 'purple',
            stats: 'Last Updated Today',
            actions: ['View Reports', 'Export'],
          },
        ].map((section, idx) => {
          const Icon = section.icon;
          const colorMap = {
            blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
            green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
            purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
          };

          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorMap[section.color]}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{section.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{section.stats}</p>
                <div className="flex gap-2 mt-4">
                  {section.actions.map((action, aidx) => (
                    <Button
                      key={aidx}
                      variant={aidx === 0 ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </MainLayout>
  );
};

export default AdminDashboardModern;
