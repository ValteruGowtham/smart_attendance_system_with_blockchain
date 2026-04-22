import React, { useState, useEffect } from 'react';
import {
  HiCheckCircle,
  HiCalendar,
  HiTrendingUp,
  HiClock,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import AlertCard from '../components/dashboard/AlertCard';
import ProgressBar from '../components/dashboard/ProgressComponents';
import DataTable from '../components/dashboard/DataTable';
import { useToast } from '../context/ToastContext';

/**
 * StudentDashboard - Refactored student dashboard with clean layout
 * Components: KPIs, ProgressBars, SubjectBreakdown, Alerts, AttendanceRecords
 */
const StudentDashboard = () => {
  const [attendance, setAttendance] = useState({
    present: 32,
    absent: 8,
    percentage: 80,
  });

  const { toast } = useToast();

  // Subject-wise breakdown
  const subjectBreakdown = [
    { name: 'Mathematics', present: 32, absent: 8, percentage: 80 },
    { name: 'Physics', present: 28, absent: 12, percentage: 70 },
    { name: 'Chemistry', present: 35, absent: 5, percentage: 88 },
    { name: 'Programming', present: 38, absent: 2, percentage: 95 },
  ];

  // Attendance records
  const attendanceRecords = [
    { date: '2024-12-20', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh' },
    { date: '2024-12-19', subject: 'Physics', status: 'Absent', faculty: 'Dr. Kumar' },
    { date: '2024-12-18', subject: 'Chemistry', status: 'Present', faculty: 'Dr. Sharma' },
    { date: '2024-12-17', subject: 'Programming', status: 'Present', faculty: 'Mr. Gupta' },
    { date: '2024-12-16', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh' },
  ];

  const attendanceColumns = [
    { key: 'date', label: 'Date' },
    { key: 'subject', label: 'Subject' },
    { key: 'faculty', label: 'Faculty' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Present'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const requiredForSafe = Math.ceil((75 - attendance.percentage) * 2);

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-500 mt-1">Track your attendance and academic progress.</p>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={HiCheckCircle}
          label="Present"
          value={attendance.present}
          color="green"
        />
        <StatCard
          icon={HiCalendar}
          label="Absent"
          value={attendance.absent}
          color="red"
        />
        <StatCard
          icon={HiTrendingUp}
          label="Attendance Rate"
          value={`${attendance.percentage}%`}
          color="blue"
        />
        <StatCard
          icon={HiClock}
          label="To Reach 75%"
          value={requiredForSafe}
          color="orange"
        />
      </div>

      {/* Row 2: Alert */}
      {attendance.percentage < 75 && (
        <div className="mb-8">
          <AlertCard
            type="warning"
            title="Attendance Warning"
            message={`Your attendance is currently ${attendance.percentage}%. You need to attend ${requiredForSafe} more classes to reach 75%.`}
          />
        </div>
      )}

      {/* Row 3: Main Content - Progress & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-1 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Overall Attendance</h3>
          <ProgressBar
            value={attendance.percentage}
            max={100}
            label="Current Attendance"
            color="blue"
          />
          <div className="mt-6 space-y-2 pt-6 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Required</span>
              <span className="font-semibold text-slate-900">75%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Current</span>
              <span className="font-semibold text-slate-900">{attendance.percentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Difference</span>
              <span className={`font-semibold ${attendance.percentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                {attendance.percentage >= 75 ? '+' : ''}{attendance.percentage - 75}%
              </span>
            </div>
          </div>
        </div>

        {/* Subject-wise Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-2 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Subject-wise Breakdown</h3>
          <div className="space-y-6">
            {subjectBreakdown.map((subject, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-900">{subject.name}</span>
                  <span className="text-xs text-slate-500">
                    {subject.present}/{subject.present + subject.absent}
                  </span>
                </div>
                <ProgressBar
                  value={subject.percentage}
                  max={100}
                  color={subject.percentage >= 75 ? 'green' : subject.percentage >= 60 ? 'yellow' : 'red'}
                  showPercentage={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Attendance Records Table */}
      <DataTable
        title="Attendance Records"
        subtitle="Your recent attendance history"
        columns={attendanceColumns}
        data={attendanceRecords}
      />
    </DashboardLayout>
  );
};

export default StudentDashboard;
