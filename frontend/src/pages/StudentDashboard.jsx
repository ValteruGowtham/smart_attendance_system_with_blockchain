import { useState, useEffect } from 'react';
import { getStudentDashboard } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  HiOutlineCheckCircle,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getStudentDashboard().then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  const { student, records, summary } = data;

  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [summary.present, summary.absent],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '600' }
        }
      },
    },
  };

  const attendanceClass = summary.percentage >= 75 ? 'text-green-600' : summary.percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
  const attendanceBg = summary.percentage >= 75 ? 'bg-green-50' : summary.percentage >= 60 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <HiOutlineUser className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {student.first_name}! 👋</h1>
              <p className="text-blue-100">{student.branch} • Year {student.year} • Section {student.section}</p>
              <p className="text-blue-100 text-sm mt-1">Reg ID: {student.registration_id}</p>
            </div>
          </div>
          <HiOutlineAcademicCap className="w-24 h-24 text-white opacity-20 hidden md:block" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Attendance Rate */}
        <div className={`${attendanceBg} rounded-2xl shadow-lg p-6 border-l-4 ${summary.percentage >= 75 ? 'border-green-500' : summary.percentage >= 60 ? 'border-yellow-500' : 'border-red-500'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-semibold">Attendance Rate</p>
            <HiOutlineChartBar className={`w-6 h-6 ${attendanceClass}`} />
          </div>
          <p className={`text-4xl font-bold ${attendanceClass}`}>{summary.percentage}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.percentage >= 75 ? '✓ Above minimum requirement' : summary.percentage >= 60 ? '⚠ Need improvement' : '✗ Below requirement'}
          </p>
        </div>

        {/* Total Present */}
        <div className="bg-green-50 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-semibold">Classes Attended</p>
            <HiOutlineCheck className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-600">{summary.present}</p>
          <p className="text-xs text-gray-500 mt-1">Present classes</p>
        </div>

        {/* Total Absent */}
        <div className="bg-red-50 rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-semibold">Classes Missed</p>
            <HiOutlineX className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-4xl font-bold text-red-600">{summary.absent}</p>
          <p className="text-xs text-gray-500 mt-1">Absent classes</p>
        </div>

        {/* Total Classes */}
        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-semibold">Total Classes</p>
            <HiOutlineBookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-blue-600">{summary.total}</p>
          <p className="text-xs text-gray-500 mt-1">Overall sessions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <HiOutlineChartBar className="w-6 h-6 text-blue-600" />
            Attendance Overview
          </h3>
          
          <div className="h-64 mb-6">
            <Doughnut data={chartData} options={chartOptions} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Present</span>
              </div>
              <span className="text-lg font-bold text-green-600">{summary.present}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Absent</span>
              </div>
              <span className="text-lg font-bold text-red-600">{summary.absent}</span>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <HiOutlineCalendar className="w-6 h-6 text-blue-600" />
            Recent Attendance History
          </h3>
          
          {records.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {records.slice(0, 10).map((record, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${
                    record.status === 'Present'
                      ? 'bg-green-50 border-green-500 hover:bg-green-100'
                      : 'bg-red-50 border-red-500 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.status === 'Present'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {record.status === 'Present' ? (
                          <HiOutlineCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <HiOutlineX className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{record.date}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <HiOutlineClock className="w-3 h-3 inline" />
                          {record.period_time || record.time} • {record.faculty_name}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status === 'Present' ? '✓ Present' : '✗ Absent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineCalendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No attendance records yet</p>
              <p className="text-sm text-gray-400 mt-1">Your attendance will appear here once marked</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Tips */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HiOutlineCheckCircle className="w-6 h-6" />
            Attendance Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li className="flex items-start gap-2">
              <span className="text-blue-200 mt-1">•</span>
              <span>Maintain at least 75% attendance to be eligible for exams</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-200 mt-1">•</span>
              <span>Attend all classes regularly to improve your percentage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-200 mt-1">•</span>
              <span>Check your attendance history regularly</span>
            </li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HiOutlineAcademicCap className="w-6 h-6" />
            Student Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-100">Name:</span>
              <span className="font-semibold">{student.first_name} {student.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-100">Registration ID:</span>
              <span className="font-semibold">{student.registration_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-100">Branch:</span>
              <span className="font-semibold">{student.branch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-100">Year & Section:</span>
              <span className="font-semibold">Year {student.year} - {student.section}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
