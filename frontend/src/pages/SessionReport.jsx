/**
 * SessionReport.jsx - Session attendance report with PDF export
 * Shows class info, summary stats, student list, and PDF download
 */

import React, { useState } from 'react';
import { HiDownload, HiQrcode, HiPrinter } from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

export default function SessionReport() {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  // Mock session data
  const sessionData = {
    classInfo: {
      faculty: 'Dr. Rajesh Singh',
      subject: 'Data Structures',
      date: 'December 20, 2024',
      period: 'Period 2',
      room: 'Lab-A-201',
      duration: '1 hour',
    },
    summary: {
      totalEnrolled: 45,
      present: 42,
      absent: 2,
      late: 1,
      attendancePercentage: 93.33,
    },
    students: [
      { name: 'Rahul Kumar', id: 'CSE2024001', status: 'Present', confidence: 98.5, timeMarked: '10:00:15' },
      { name: 'Priya Sharma', id: 'CSE2024005', status: 'Present', confidence: 97.2, timeMarked: '10:01:45' },
      { name: 'Arjun Singh', id: 'IT2024012', status: 'Absent', confidence: 0, timeMarked: '-' },
      { name: 'Neha Patel', id: 'ECE2024008', status: 'Present', confidence: 96.8, timeMarked: '10:02:10' },
      { name: 'Amit Verma', id: 'CSE2024015', status: 'Late', confidence: 95.3, timeMarked: '10:15:30' },
      { name: 'Sneha Roy', id: 'MECH2024003', status: 'Present', confidence: 98.1, timeMarked: '10:00:50' },
    ],
    blockchainTx: 'a3f8c1e9b2d4f7a6c5e8b1d3f9a2c4e6b7d9f0a1c3e5f7a8b0d2e4f6a8c',
  };

  const handleDownloadPDF = () => {
    setIsPrinting(true);
    setTimeout(() => {
      toast.success('PDF downloaded successfully');
      setIsPrinting(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Session Report</h1>
          <p className="text-slate-500 mt-1">Attendance session report and blockchain verification</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors"
          >
            <HiPrinter className="w-5 h-5" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isPrinting}
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${
              isPrinting
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <HiDownload className="w-5 h-5" />
            {isPrinting ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Header Section */}
        <div className="border-b border-slate-200 p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto">
            {/* Institution Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Smart Attendance System</h2>
              <p className="text-sm text-slate-600">AI-Powered Attendance with Blockchain Verification</p>
            </div>

            {/* Class Info */}
            <div className="grid grid-cols-2 gap-6 bg-white rounded-lg p-6 border border-blue-200">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-500">Faculty</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{sessionData.classInfo.faculty}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-500">Subject</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{sessionData.classInfo.subject}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-500">Date & Time</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{sessionData.classInfo.date}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-500">Period & Room</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{sessionData.classInfo.period} • {sessionData.classInfo.room}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="border-b border-slate-200 p-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-900 mb-4">Session Summary</h3>
            <div className="grid grid-cols-5 gap-4">
              {/* Total Enrolled */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Enrolled</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{sessionData.summary.totalEnrolled}</p>
              </div>

              {/* Present */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-600 uppercase">Present</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{sessionData.summary.present}</p>
              </div>

              {/* Absent */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-red-600 uppercase">Absent</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{sessionData.summary.absent}</p>
              </div>

              {/* Late */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-600 uppercase">Late</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{sessionData.summary.late}</p>
              </div>

              {/* Attendance % */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-purple-600 uppercase">Attendance %</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{sessionData.summary.attendancePercentage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-900 mb-4">Student Attendance List</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Registration ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Confidence</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Time Marked</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionData.students.map((student, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{student.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            student.status === 'Present'
                              ? 'bg-green-100 text-green-700'
                              : student.status === 'Absent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {student.confidence > 0 ? `${student.confidence}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{student.timeMarked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Blockchain Section */}
        <div className="border-t border-slate-200 p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <HiQrcode className="w-5 h-5 text-blue-600" />
                  Blockchain Verification
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  This attendance session has been recorded on the blockchain for immutability and verification.
                </p>
                <div className="bg-white rounded-lg p-4 border border-slate-200 font-mono text-xs text-slate-600 break-all">
                  {sessionData.blockchainTx}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white border-4 border-slate-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-300">QR</div>
                    <p className="text-xs text-slate-400 mt-1">Code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-8 text-center text-xs text-slate-500">
          <p>This is an automatically generated report from Smart Attendance System</p>
          <p>Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .bg-white {
            break-inside: avoid;
          }
          button, .no-print {
            display: none;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
