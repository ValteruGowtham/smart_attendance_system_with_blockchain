/**
 * AttendanceAlerts.jsx - Low Attendance Early Warning System
 * Shows students below 75% with alert options and recovery info
 */

import React, { useState } from 'react';
import {
  HiExclamationCircle,
  HiBell,
  HiFilter,
  HiX,
  HiMail,
  HiPhone,
  HiCheckCircle,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

export default function AttendanceAlerts() {
  const { toast } = useToast();
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageType, setMessageType] = useState('email');
  const [messageText, setMessageText] = useState('');

  // Mock data: Students at risk
  const studentsAtRisk = [
    { id: 1, name: 'Rahul Kumar', regId: 'CSE2024001', branch: 'CSE', year: '2', section: 'A', subject: 'Mathematics', percentage: 68, classesNeeded: 8 },
    { id: 2, name: 'Priya Sharma', regId: 'CSE2024005', branch: 'CSE', year: '2', section: 'B', subject: 'Physics', percentage: 72, classesNeeded: 5 },
    { id: 3, name: 'Arjun Singh', regId: 'IT2024012', branch: 'IT', year: '3', section: 'A', subject: 'Chemistry', percentage: 65, classesNeeded: 12 },
    { id: 4, name: 'Neha Patel', regId: 'ECE2024008', branch: 'ECE', year: '2', section: 'C', subject: 'Programming', percentage: 70, classesNeeded: 6 },
    { id: 5, name: 'Amit Verma', regId: 'CSE2024015', branch: 'CSE', year: '3', section: 'A', subject: 'Database', percentage: 60, classesNeeded: 15 },
    { id: 6, name: 'Sneha Roy', regId: 'MECH2024003', branch: 'MECH', year: '1', section: 'B', subject: 'Engineering', percentage: 62, classesNeeded: 13 },
  ];

  // Stats
  const stats = {
    totalAtRisk: studentsAtRisk.length,
    mostAffectedDept: 'CSE',
    mostAffectedSubject: 'Mathematics',
  };

  // Filter students
  const filteredStudents = studentsAtRisk.filter(s => {
    if (filterBranch !== 'All' && s.branch !== filterBranch) return false;
    if (filterYear !== 'All' && s.year !== filterYear) return false;
    if (filterSection !== 'All' && s.section !== filterSection) return false;
    return true;
  });

  // Status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage < 60) return { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' };
    if (percentage < 70) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Warning' };
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'At Risk' };
  };

  const handleSendAlert = (student) => {
    setSelectedStudent(student);
    setMessageText(
      `Dear ${student.name},\n\nYour attendance in ${student.subject} has dropped to ${student.percentage}%. You need to attend at least ${student.classesNeeded} more classes to maintain 75% attendance.\n\nPlease ensure regular attendance going forward.\n\nBest regards,\nAcademic Team`
    );
    setShowAlertModal(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    toast.success(`${messageType === 'email' ? 'Email' : 'SMS'} sent to ${selectedStudent.name}`);
    setShowAlertModal(false);
  };

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Attendance Alerts</h1>
        <p className="text-slate-500 mt-1">Early warning system for students below 75% attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Total At Risk */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold">Students at Risk</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.totalAtRisk}</p>
            </div>
            <HiExclamationCircle className="w-12 h-12 text-red-400 opacity-60" />
          </div>
        </div>

        {/* Most Affected Department */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-semibold">Most Affected Dept</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.mostAffectedDept}</p>
            </div>
            <HiBell className="w-12 h-12 text-orange-400 opacity-60" />
          </div>
        </div>

        {/* Most Affected Subject */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold">Most Affected Subject</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stats.mostAffectedSubject}</p>
            </div>
            <HiFilter className="w-12 h-12 text-amber-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map(student => {
          const status = getStatusColor(student.percentage);
          return (
            <div key={student.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                {/* Left Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">ID: {student.regId}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-slate-600">
                      <strong>{student.branch}</strong> • Year {student.year} • Section {student.section}
                    </span>
                    <span className="text-sm text-slate-600">
                      Subject: <strong>{student.subject}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Stats */}
                <div className="flex items-end gap-6 ml-4">
                  {/* Percentage */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${status.text}`}>{student.percentage}%</div>
                    <p className={`text-xs font-semibold mt-1 ${status.text}`}>{status.label}</p>
                  </div>

                  {/* Classes Needed */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{student.classesNeeded}</div>
                    <p className="text-xs text-slate-500 mt-1">Classes needed</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-20 h-20">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={student.percentage >= 75 ? '#22c55e' : student.percentage >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="4"
                        strokeDasharray={`${(student.percentage / 100) * 251} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-center text-xs font-bold text-slate-600 -mt-16">{student.percentage}%</div>
                  </div>

                  {/* Send Alert Button */}
                  <button
                    onClick={() => handleSendAlert(student)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <HiBell className="w-4 h-4" />
                    Send Alert
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
          <p className="text-slate-500 text-lg">No students below 75% attendance in selected filters</p>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Send Alert to {selectedStudent?.name}</h2>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Message Type Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                <button
                  onClick={() => setMessageType('email')}
                  className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    messageType === 'email'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HiMail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => setMessageType('sms')}
                  className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    messageType === 'sms'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HiPhone className="w-4 h-4" />
                  SMS
                </button>
              </div>

              {/* Message Editor */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Edit your message here..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 flex gap-2 justify-end sticky bottom-0 bg-slate-50">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Send {messageType === 'email' ? 'Email' : 'SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
