import React, { useState, useEffect } from 'react';
import {
  HiUsers,
  HiAcademicCap,
  HiClipboardList,
  HiClock,
  HiChevronDown,
  HiExclamationCircle,
  HiCheckCircle,
  HiCube,
  HiTrendingUp,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

/**
 * AdminDashboard - Command center for attendance system
 * Top: 4 KPI cards, Date range filter
 * Middle: Area chart (departments), Donut chart (attendance split)
 * Bottom: Activity feed, Alert panel for low attendance students
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_students: 1234,
    todays_present_percentage: 87,
    active_sessions: 8,
    blockchain_transactions: 2456,
  });

  const [dateRange, setDateRange] = useState('today');
  const { toast } = useToast();

  // Department-wise attendance data for area chart
  const departmentData = [
    { dept: 'CSE', present: 145, absent: 23, late: 12 },
    { dept: 'ECE', present: 132, absent: 28, late: 15 },
    { dept: 'ME', present: 118, absent: 32, late: 10 },
    { dept: 'CE', present: 105, absent: 35, late: 8 },
    { dept: 'EE', present: 98, absent: 22, late: 6 },
  ];

  // Activity feed data
  const activityData = [
    { id: 1, action: 'Rahul Kumar', type: 'Recognized', faculty: 'Dr. Singh', time: '10:02:15', department: 'CSE' },
    { id: 2, action: 'Priya Sharma', type: 'Recognized', faculty: 'Dr. Kumar', time: '09:58:43', department: 'ECE' },
    { id: 3, action: 'Arjun Singh', type: 'Recognized', faculty: 'Mr. Gupta', time: '09:45:22', department: 'ME' },
    { id: 4, action: 'Neha Patel', type: 'Marked', faculty: 'Dr. Sharma', time: '09:30:10', department: 'CSE' },
    { id: 5, action: 'Amit Verma', type: 'Recognized', faculty: 'Dr. Singh', time: '09:15:45', department: 'CE' },
  ];

  // Low attendance students alert
  const lowAttendanceStudents = [
    { name: 'John Doe', rollNo: 'CS101', percentage: 62, deficit: 13 },
    { name: 'Jane Smith', rollNo: 'CS102', percentage: 58, deficit: 17 },
    { name: 'Mike Johnson', rollNo: 'EC103', percentage: 68, deficit: 7 },
    { name: 'Sarah Williams', rollNo: 'ME104', percentage: 65, deficit: 10 },
    { name: 'Tom Brown', rollNo: 'CE105', percentage: 71, deficit: 4 },
  ];

  // Attendance split (Present/Absent/Late)
  const attendanceSplit = {
    present: 852,
    absent: 285,
    late: 97,
  };

  const total = attendanceSplit.present + attendanceSplit.absent + attendanceSplit.late;
  const presentPct = ((attendanceSplit.present / total) * 100).toFixed(1);
  const absentPct = ((attendanceSplit.absent / total) * 100).toFixed(1);
  const latePct = ((attendanceSplit.late / total) * 100).toFixed(1);

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-slate-200 rounded-lg p-4 mb-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">Command Center</h2>
            <div className="h-6 w-px bg-slate-200"></div>
            <span className="text-sm text-slate-600">Real-time Dashboard</span>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
              </select>
              <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total_students}</p>
              <p className="text-xs text-green-600 mt-2 font-semibold">↑ 5 new enrollments</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's Present % */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today's Present %</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.todays_present_percentage}%</p>
              <p className="text-xs text-green-600 mt-2 font-semibold">↑ 3% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.active_sessions}</p>
              <p className="text-xs text-indigo-600 mt-2 font-semibold">Live right now</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Blockchain Transactions */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Blockchain Tx's</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.blockchain_transactions}</p>
              <p className="text-xs text-purple-600 mt-2 font-semibold">↑ 156 today</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HiCube className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Area Chart - Department Attendance */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Attendance by Department</h3>
            <p className="text-sm text-slate-500 mt-1">Today's attendance across departments</p>
          </div>

          {/* Simplified Chart Visualization */}
          <div className="space-y-4">
            {departmentData.map((dept, idx) => {
              const total = dept.present + dept.absent + dept.late;
              const presentPct = ((dept.present / total) * 100).toFixed(0);
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{dept.dept}</span>
                    <span className="text-sm text-slate-600">{dept.present}/{total} present ({presentPct}%)</span>
                  </div>
                  <div className="flex h-8 gap-1 rounded-lg overflow-hidden bg-slate-100">
                    <div
                      className="bg-green-500 flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${presentPct}%` }}
                    >
                      {presentPct > 10 && presentPct + '%'}
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${((dept.absent / total) * 100).toFixed(0)}%` }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${((dept.late / total) * 100).toFixed(0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart - Attendance Split */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Attendance Overview</h3>
            <p className="text-sm text-slate-500 mt-1">Total: {total} students</p>
          </div>

          {/* Simplified Donut Chart */}
          <div className="flex justify-center mb-6">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" strokeWidth="15" />
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="#10b981"
                strokeWidth="15"
                strokeDasharray={`${(presentPct / 100) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                className="transform -rotate-90 origin-center"
              />
              <text x="70" y="70" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill="#1e293b">
                {presentPct}%
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Present</p>
                <p className="text-xs text-slate-500">{attendanceSplit.present}</p>
              </div>
              <span className="text-sm font-bold text-slate-900">{presentPct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Absent</p>
                <p className="text-xs text-slate-500">{attendanceSplit.absent}</p>
              </div>
              <span className="text-sm font-bold text-slate-900">{absentPct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Late</p>
                <p className="text-xs text-slate-500">{attendanceSplit.late}</p>
              </div>
              <span className="text-sm font-bold text-slate-900">{latePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Activity Feed & Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-indigo-600" />
              Real-time Activity Feed
            </h3>
            <p className="text-sm text-slate-500 mt-1">Live recognition events</p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityData.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {activity.action.charAt(0)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {activity.action}
                    <span className="text-indigo-600 ml-1">• {activity.type}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Faculty: {activity.faculty} | {activity.department}
                  </p>
                </div>

                {/* Time */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-900">{activity.time}</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Panel - Low Attendance */}
        <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HiExclamationCircle className="w-5 h-5 text-red-600" />
              Low Attendance Alert
            </h3>
            <p className="text-sm text-slate-500 mt-1">Below 75% threshold</p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lowAttendanceStudents.map((student, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  student.percentage < 65
                    ? 'bg-red-50 border-red-500'
                    : 'bg-amber-50 border-amber-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{student.rollNo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${student.percentage < 65 ? 'text-red-600' : 'text-amber-600'}`}>
                      {student.percentage}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      -{student.deficit}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors text-sm">
            View All at Risk
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
