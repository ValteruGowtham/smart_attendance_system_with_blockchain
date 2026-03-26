import { useState, useEffect } from 'react';
import { getAttendance } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineClipboardCheck, HiOutlineUser, HiOutlineAcademicCap } from 'react-icons/hi';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ViewAttendance() {
  const [records, setRecords] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [search, setSearch] = useState('');

  const fetchData = (q = '') => {
    getAttendance(q).then((r) => {
      setRecords(r.data.records);
      setPresentCount(r.data.present_count);
      setAbsentCount(r.data.absent_count);
    }).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const attendanceRate = presentCount + absentCount > 0 
    ? ((presentCount / (presentCount + absentCount)) * 100).toFixed(1) 
    : 0;

  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [presentCount, absentCount],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      borderRadius: 8,
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
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <HiOutlineClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Attendance Records</h1>
              <p className="text-amber-100 text-sm">Monitor and analyze attendance across all classes</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-bold">{records.length}</div>
            <div className="text-amber-100 text-sm">Total Records</div>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <HiOutlineSearch className="w-5 h-5 text-amber-600" />
              Search Records
            </label>
            <div className="flex gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Registration ID or Faculty UID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Search
              </button>
              {search && (
                <button 
                  type="button" 
                  onClick={() => { setSearch(''); fetchData(''); }} 
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Analytics Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-amber-600" />
              Quick Stats
            </h4>
            {(presentCount > 0 || absentCount > 0) ? (
              <div className="space-y-4">
                <div className="h-36">
                  <Pie data={chartData} options={chartOptions} />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-xs text-gray-500 font-medium">Present</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{absentCount}</div>
                    <div className="text-xs text-gray-500 font-medium">Absent</div>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <div className="text-xl font-bold text-amber-600">{attendanceRate}%</div>
                    <div className="text-xs text-gray-500 font-medium">Rate</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <HiOutlineClipboardCheck className="w-5 h-5 text-amber-600" />
            All Records
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Faculty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {records.length > 0 ? (
                records.map((a, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animation: `fade-in 0.3s ease-out ${Math.min(i * 0.03, 0.5)}s both` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HiOutlineCalendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{a.date}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700 whitespace-nowrap">
                        {a.period_time || a.time}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <HiOutlineUser className="w-3 h-3 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{a.faculty_name}</div>
                          <div className="text-xs text-gray-500 font-mono">{a.faculty_uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <HiOutlineAcademicCap className="w-3 h-3 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{a.student_name}</div>
                          <div className="text-xs text-gray-500 font-mono">{a.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md whitespace-nowrap">
                          {a.branch}
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md whitespace-nowrap">
                          Y{a.year}
                        </span>
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md whitespace-nowrap">
                          {a.section}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md text-center block w-fit">
                        P{a.period}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                        a.status === 'Present'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {a.status === 'Present' ? '✓' : '✗'} {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <HiOutlineClipboardCheck className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No attendance records found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {search ? 'Try adjusting your search' : 'Records will appear here once attendance is marked'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
