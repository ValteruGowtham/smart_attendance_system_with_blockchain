import React, { useState, useEffect } from 'react';
import {
  HiUsers,
  HiAcademicCap,
  HiClipboardList,
  HiClock,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import AlertCard from '../components/dashboard/AlertCard';
import DataTable from '../components/dashboard/DataTable';
import { useToast } from '../context/ToastContext';

/**
 * AdminDashboard - Refactored admin dashboard with structured layout
 * Components: StatCards, Charts, Alerts, DataTable
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_students: 1234,
    total_faculty: 45,
    attendance_rate: 92,
    active_sessions: 8,
  });
  const { toast } = useToast();

  // Mock activity data
  const activityData = [
    { id: 1, action: 'Student Added', user: 'Admin', time: '2 mins ago', status: 'success' },
    { id: 2, action: 'Faculty Updated', user: 'Admin', time: '15 mins ago', status: 'info' },
    { id: 3, action: 'Attendance Marked', user: 'Dr. Kumar', time: '45 mins ago', status: 'success' },
    { id: 4, action: 'Report Generated', user: 'Admin', time: '2 hours ago', status: 'info' },
    { id: 5, action: 'System Health Check', user: 'System', time: '3 hours ago', status: 'success' },
  ];

  const activityColumns = [
    { key: 'action', label: 'Action' },
    { key: 'user', label: 'User' },
    { key: 'time', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {value === 'success' ? 'Completed' : 'Info'}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's your attendance overview.</p>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={HiUsers}
          label="Total Students"
          value={stats.total_students}
          change={5}
          changeType="positive"
          color="blue"
        />
        <StatCard
          icon={HiAcademicCap}
          label="Total Faculty"
          value={stats.total_faculty}
          change={2}
          changeType="positive"
          color="green"
        />
        <StatCard
          icon={HiClipboardList}
          label="Attendance Rate"
          value={`${stats.attendance_rate}%`}
          change={3}
          changeType="positive"
          color="purple"
        />
        <StatCard
          icon={HiClock}
          label="Active Sessions"
          value={stats.active_sessions}
          change={8}
          changeType="positive"
          color="orange"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Attendance Trend" subtitle="Last 7 days">
          <div className="flex items-center justify-center text-gray-400">
            Line chart placeholder
          </div>
        </ChartCard>
        <ChartCard title="Department Comparison" subtitle="Student count by department">
          <div className="flex items-center justify-center text-gray-400">
            Bar chart placeholder
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Alerts */}
      <div className="space-y-3 mb-8">
        <AlertCard
          type="warning"
          title="Low Attendance Alert"
          message="15 students have attendance below 75%. Immediate action recommended."
        />
        <AlertCard
          type="info"
          title="System Update"
          message="Weekly data sync completed successfully. All records updated."
        />
      </div>

      {/* Row 4: Activity Table */}
      <DataTable title="Recent Activity" subtitle="Latest system actions" columns={activityColumns} data={activityData} />
    </DashboardLayout>
  );
};

export default AdminDashboard;
