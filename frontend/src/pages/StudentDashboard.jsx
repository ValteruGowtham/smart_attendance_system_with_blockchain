import React, { useState, useEffect } from 'react';
import {
  HiCheckCircle,
  HiCalendar,
  HiTrendingUp,
  HiClock,
  HiDownload,
  HiExclamation,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

/**
 * StudentDashboard - Personal attendance analytics app
 * Large circular progress ring, subject-wise bars, calendar heatmap, timeline
 */
const StudentDashboard = () => {
  const [attendance, setAttendance] = useState({
    present: 76,
    absent: 24,
    percentage: 76,
  });

  const { toast } = useToast();

  // Subject-wise breakdown
  const subjectBreakdown = [
    { name: 'Mathematics', present: 32, absent: 8, percentage: 80 },
    { name: 'Physics', present: 28, absent: 12, percentage: 70 },
    { name: 'Chemistry', present: 35, absent: 5, percentage: 88 },
    { name: 'Programming', present: 38, absent: 2, percentage: 95 },
  ];

  // Attendance records (last 10)
  const attendanceRecords = [
    { date: '2024-12-20', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh', time: '10:30 AM' },
    { date: '2024-12-19', subject: 'Physics', status: 'Absent', faculty: 'Dr. Kumar', time: '09:00 AM' },
    { date: '2024-12-18', subject: 'Chemistry', status: 'Present', faculty: 'Dr. Sharma', time: '11:00 AM' },
    { date: '2024-12-17', subject: 'Programming', status: 'Present', faculty: 'Mr. Gupta', time: '02:00 PM' },
    { date: '2024-12-16', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh', time: '10:30 AM' },
    { date: '2024-12-15', subject: 'Physics', status: 'Present', faculty: 'Dr. Kumar', time: '09:00 AM' },
    { date: '2024-12-14', subject: 'Chemistry', status: 'Absent', faculty: 'Dr. Sharma', time: '11:00 AM' },
    { date: '2024-12-13', subject: 'Programming', status: 'Present', faculty: 'Mr. Gupta', time: '02:00 PM' },
    { date: '2024-12-12', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh', time: '10:30 AM' },
    { date: '2024-12-11', subject: 'Physics', status: 'Present', faculty: 'Dr. Kumar', time: '09:00 AM' },
  ];

  // Generate calendar heatmap data for past 3 months (simplified)
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isPresent = Math.random() > 0.3; // 70% present
      const noClass = Math.random() > 0.8; // 20% no class
      data.push({
        date: date.toISOString().split('T')[0],
        status: noClass ? 'no-class' : isPresent ? 'present' : 'absent',
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  // Get status color
  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { color: 'green', label: 'Good Standing', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (percentage >= 65) return { color: 'amber', label: 'At Risk', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { color: 'red', label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  };

  const status = getAttendanceStatus(attendance.percentage);

  // Handle download certificate
  const handleDownloadCertificate = () => {
    toast.success('Certificate download started');
    // In real app, this would trigger API call
  };

  // Calculate progress ring
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (attendance.percentage / 100) * circumference;

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
        <p className="text-slate-500 mt-1">Track your attendance and academic progress.</p>
      </div>

      {/* Row 1: Large Circular Progress Ring */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Circular Progress */}
          <div className="flex flex-col items-center flex-1">
            <svg width="280" height="280" className="transform -rotate-90">
              <circle
                cx="140"
                cy="140"
                r="70"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                cx="140"
                cy="140"
                r="70"
                fill="none"
                stroke={status.color === 'green' ? '#16a34a' : status.color === 'amber' ? '#d97706' : '#dc2626'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <text
                x="140"
                y="140"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="48"
                fontWeight="bold"
                fill="#1e293b"
              >
                {attendance.percentage}%
              </text>
              <text
                x="140"
                y="160"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fill="#64748b"
              >
                Attendance
              </text>
            </svg>
          </div>

          {/* Status Info */}
          <div className={`${status.bg} border ${status.border} rounded-lg p-6 flex-1 ml-8`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={`text-sm font-semibold ${status.text}`}>{status.label}</p>
                <p className="text-slate-700 text-lg font-bold mt-2">{attendance.percentage}% Attendance</p>
              </div>
              {attendance.percentage >= 75 ? (
                <HiCheckCircle className={`w-8 h-8 ${status.text}`} />
              ) : (
                <HiExclamation className={`w-8 h-8 ${status.text}`} />
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Classes:</span>
                <span className="font-semibold text-slate-900">{attendance.present + attendance.absent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Present:</span>
                <span className="font-semibold text-green-600">{attendance.present}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Absent:</span>
                <span className="font-semibold text-red-600">{attendance.absent}</span>
              </div>
              <div className="pt-3 border-t border-current opacity-20">
                <span className="text-slate-600">Required:</span>
                <span className="ml-2 font-semibold text-slate-900">75%</span>
              </div>
            </div>

            {/* Certificate Download Button */}
            {attendance.percentage >= 75 && (
              <button
                onClick={handleDownloadCertificate}
                className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <HiDownload className="w-5 h-5" />
                Download Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Subject-wise Attendance */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Subject-wise Attendance</h3>
        <div className="space-y-5">
          {subjectBreakdown.map((subject, idx) => {
            const subjectStatus = subject.percentage >= 75 ? 'green' : subject.percentage >= 65 ? 'amber' : 'red';
            const colorMap = {
              green: 'bg-green-600',
              amber: 'bg-amber-500',
              red: 'bg-red-600',
            };
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{subject.name}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {subject.present}/{subject.present + subject.absent}
                    </span>
                  </div>
                  <span className={`font-bold text-sm ${subjectStatus === 'green' ? 'text-green-600' : subjectStatus === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
                    {subject.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorMap[subjectStatus]} transition-all duration-300`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Calendar Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Attendance Heatmap (Last 3 Months)</h3>
        <div className="flex gap-1 flex-wrap">
          {heatmapData.map((day, idx) => {
            let color = 'bg-slate-100';
            if (day.status === 'present') color = 'bg-green-400';
            else if (day.status === 'absent') color = 'bg-red-400';
            else color = 'bg-slate-50 border border-slate-200';

            return (
              <div
                key={idx}
                className={`w-6 h-6 rounded ${color} cursor-pointer hover:ring-2 hover:ring-slate-400 transition-all`}
                title={`${day.date}: ${day.status}`}
              />
            );
          })}
        </div>
        <div className="flex gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-slate-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded"></div>
            <span className="text-slate-600">No Class</span>
          </div>
        </div>
      </div>

      {/* Row 4: Attendance Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Attendance (Last 10)</h3>
        <div className="space-y-3">
          {attendanceRecords.map((record, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-colors ${
                record.status === 'Present'
                  ? 'bg-green-50 border-green-500 hover:bg-green-100'
                  : 'bg-red-50 border-red-500 hover:bg-red-100'
              }`}
            >
              {/* Date */}
              <div className="min-w-fit">
                <p className="text-xs text-slate-500 font-semibold">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-slate-600">{record.time}</p>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{record.subject}</p>
                <p className="text-xs text-slate-500 mt-1">Faculty: {record.faculty}</p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    record.status === 'Present'
                      ? 'bg-green-200 text-green-700'
                      : 'bg-red-200 text-red-700'
                  }`}
                >
                  {record.status === 'Present' ? (
                    <HiCheckCircle className="w-4 h-4" />
                  ) : (
                    <HiExclamation className="w-4 h-4" />
                  )}
                  {record.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
