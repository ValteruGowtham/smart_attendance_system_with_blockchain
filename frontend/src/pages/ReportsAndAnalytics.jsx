import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import {
  HiOutlineDownload,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlinePrinter,
} from 'react-icons/hi';

export default function ReportsAndAnalytics() {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock data for reports
  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [850, 150, 45],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderColor: ['#059669', '#dc2626', '#d97706'],
        borderWidth: 2,
      },
    ],
  };

  const attendanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Attendance %',
        data: [85, 87, 82, 89, 91, 88],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const branchWiseData = {
    labels: ['CSE', 'IT', 'ECE', 'MECH', 'CHEM', 'CIVIL'],
    datasets: [
      {
        label: 'Average Attendance %',
        data: [92, 88, 85, 83, 89, 87],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
        ],
        borderWidth: 0,
      },
    ],
  };

  const handleExport = (format) => {
    alert(`Exporting ${selectedReport} report as ${format}...`);
    // Implementation: Generate and download PDF/CSV
  };

  const handlePrint = () => {
    window.print();
  };

  const reports = [
    { id: 'attendance', label: 'Attendance Overview', icon: '📊' },
    { id: 'trends', label: 'Attendance Trends', icon: '📈' },
    { id: 'branch-wise', label: 'Branch-wise Analysis', icon: '🏢' },
    { id: 'student-wise', label: 'Student-wise Details', icon: '👥' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics Dashboard</h1>
        <p className="text-blue-100">Generate, analyze, and export attendance reports with advanced filtering</p>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reports.map((report) => (
          <motion.button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl transition-all ${
              selectedReport === report.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="text-2xl mb-2">{report.icon}</div>
            <p className="font-semibold text-sm text-center">{report.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HiOutlineCalendar className="w-5 h-5" />
          Filters & Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Departments</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Distribution</h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <Pie data={attendanceData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </motion.div>

        {/* Chart 2 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Branch-wise Attendance</h3>
          <div className="h-80">
            <Bar
              data={branchWiseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Trends Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Trends Over Time</h3>
        <div className="h-80">
          <Line
            data={attendanceTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
            }}
          />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: '1,250', change: '+5%' },
          { label: 'Avg Attendance', value: '87%', change: '+2%' },
          { label: 'Total Classes', value: '450', change: '+10%' },
          { label: 'At-Risk Students', value: '45', change: '-3%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
          >
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">{stat.value}</h4>
            <p className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} from last month
            </p>
          </motion.div>
        ))}
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border-2 border-indigo-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HiOutlineDownload className="w-6 h-6" />
          Export & Print
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export as CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <HiOutlinePrinter className="w-5 h-5" />
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
