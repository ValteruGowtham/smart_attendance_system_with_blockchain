/**
 * AttendanceCalendar.jsx - Full-month attendance heatmap calendar
 * Shows attendance rates for each day with filtering and day details drawer
 */

import React, { useState } from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiUsers,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterClass, setFilterClass] = useState('All');

  // Mock attendance data by day
  const attendanceData = {
    '2024-12-02': { total: 120, present: 108, absent: 12, rate: 90, faculty: 'Dr. Singh' },
    '2024-12-03': { total: 120, present: 90, absent: 30, rate: 75, faculty: 'Dr. Kumar' },
    '2024-12-04': { total: 120, present: 72, absent: 48, rate: 60, faculty: 'Dr. Sharma' },
    '2024-12-05': { total: 120, present: 114, absent: 6, rate: 95, faculty: 'Mr. Gupta' },
    '2024-12-09': { total: 120, present: 105, absent: 15, rate: 87, faculty: 'Dr. Singh' },
    '2024-12-10': { total: 120, present: 60, absent: 60, rate: 50, faculty: 'Dr. Patel' },
    '2024-12-11': { total: 120, present: 102, absent: 18, rate: 85, faculty: 'Dr. Kumar' },
    '2024-12-12': { total: 120, present: 110, absent: 10, rate: 92, faculty: 'Mr. Singh' },
    '2024-12-13': { total: 120, present: 88, absent: 32, rate: 73, faculty: 'Dr. Sharma' },
    '2024-12-16': { total: 120, present: 115, absent: 5, rate: 96, faculty: 'Dr. Singh' },
    '2024-12-17': { total: 120, present: 100, absent: 20, rate: 83, faculty: 'Dr. Kumar' },
  };

  // Holidays (mock data)
  const holidays = ['2024-12-01', '2024-12-08', '2024-12-15', '2024-12-25', '2024-12-26'];

  // Student list for selected day
  const dayStudents = [
    { name: 'Rahul Kumar', id: 'CSE2024001', status: 'Present', confidence: 98.5 },
    { name: 'Priya Sharma', id: 'CSE2024005', status: 'Present', confidence: 97.2 },
    { name: 'Arjun Singh', id: 'IT2024012', status: 'Absent', confidence: 0 },
    { name: 'Neha Patel', id: 'ECE2024008', status: 'Present', confidence: 96.8 },
  ];

  // Get attendance color
  const getColorClass = (rate) => {
    if (rate >= 90) return 'bg-green-600'; // Dark green
    if (rate >= 75) return 'bg-green-300'; // Light green
    if (rate >= 60) return 'bg-amber-300'; // Amber
    if (rate < 60) return 'bg-red-400'; // Red
    return 'bg-gray-300'; // Gray for holidays/no class
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Format date key
  const formatDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateKey = formatDateKey(day);
    if (attendanceData[dateKey] && !holidays.includes(dateKey)) {
      setSelectedDay({ day, dateKey, data: attendanceData[dateKey] });
    }
  };

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Attendance Calendar</h1>
        <p className="text-slate-500 mt-1">Monthly attendance heatmap with daily insights</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HiChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 w-40 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HiChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Classes</option>
            <option value="CSE-2-A">CSE 2-A</option>
            <option value="CSE-2-B">CSE 2-B</option>
            <option value="IT-3-A">IT 3-A</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex gap-8 mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-sm text-slate-600">90%+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span className="text-sm text-slate-600">75-89%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-300 rounded"></div>
            <span className="text-sm text-slate-600">60-74%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-sm text-slate-600">Below 60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-sm text-slate-600">Holiday/No Class</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const dateKey = formatDateKey(day);
              const isHoliday = holidays.includes(dateKey);
              const data = attendanceData[dateKey];
              const colorClass = isHoliday ? 'bg-gray-300' : data ? getColorClass(data.rate) : 'bg-gray-100';
              const isClickable = !isHoliday && data;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`p-3 rounded-lg border border-slate-200 transition-all ${
                    isClickable
                      ? `${colorClass} text-white font-semibold cursor-pointer hover:shadow-md hover:scale-105`
                      : `${colorClass} text-slate-600 font-semibold cursor-default`
                  }`}
                  title={data ? `${data.rate}% attendance` : 'Holiday'}
                >
                  <div className="text-sm">{day}</div>
                  {data && (
                    <div className="text-xs mt-1 opacity-90">{data.rate}%</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Details Drawer */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => setSelectedDay(null)} />
      )}
      
      <div
        className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          selectedDay ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        {selectedDay && (
          <>
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4 sticky top-0 bg-white flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {monthNames[currentDate.getMonth()]} {selectedDay.day}, {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="p-6 space-y-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Faculty:</span>
                <span className="font-semibold text-slate-900">{selectedDay.data.faculty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Total Students:</span>
                <span className="font-semibold text-slate-900">{selectedDay.data.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Attendance Rate:</span>
                <span className="font-semibold text-green-600">{selectedDay.data.rate}%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <HiCheckCircle className="w-5 h-5" />
                    Present: {selectedDay.data.present}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700 font-semibold">
                    <HiXCircle className="w-5 h-5" />
                    Absent: {selectedDay.data.absent}
                  </div>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HiUsers className="w-5 h-5" />
                Student List
              </h4>
              <div className="space-y-3">
                {dayStudents.map((student, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          student.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                    {student.status === 'Present' && (
                      <p className="text-xs text-slate-600">
                        Confidence: <strong>{student.confidence}%</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
