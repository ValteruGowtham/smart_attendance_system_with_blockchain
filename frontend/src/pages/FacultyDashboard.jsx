import React, { useState, useRef } from 'react';
import {
  HiVideoCamera,
  HiPlay,
  HiStop,
  HiUsers,
  HiClock,
  HiCheckCircle,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import AlertCard from '../components/dashboard/AlertCard';
import DataTable from '../components/dashboard/DataTable';
import { useToast } from '../context/ToastContext';

/**
 * FacultyDashboard - Refactored faculty dashboard with session management
 * Components: Session Controls, Camera Preview, Recognized Students, Today's Records
 */
const FacultyDashboard = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [markedStudents, setMarkedStudents] = useState([]);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const { toast } = useToast();

  // Mock recognized students
  const recognizedStudents = [
    { id: 101, name: 'Rahul Kumar', detected: true, confidence: 0.98 },
    { id: 102, name: 'Priya Sharma', detected: true, confidence: 0.95 },
    { id: 103, name: 'Arjun Singh', detected: true, confidence: 0.92 },
    { id: 104, name: 'Neha Patel', detected: false, confidence: 0 },
    { id: 105, name: 'Amit Verma', detected: false, confidence: 0 },
  ];

  // Mock today's records
  const todayRecords = [
    { class: 'CSE-8A', time: '10:30 AM', marked: 42, total: 45, status: 'Completed' },
    { class: 'ECE-8B', time: '11:45 AM', marked: 38, total: 40, status: 'Completed' },
  ];

  const recordsColumns = [
    { key: 'class', label: 'Class' },
    { key: 'time', label: 'Time' },
    { key: 'marked', label: 'Marked' },
    { key: 'total', label: 'Total' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          {value}
        </span>
      ),
    },
  ];

  // Start session
  const handleStartSession = () => {
    setSessionActive(true);
    setTimer(0);
    setMarkedStudents([]);
    toast.success('Attendance session started');

    // Start timer
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    // Request camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        toast.warning('Camera access denied');
      });
  };

  // End session
  const handleEndSession = () => {
    setSessionActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    toast.success('Attendance session ended');
  };

  // Mark attendance
  const handleMarkAttendance = (studentId) => {
    if (!markedStudents.includes(studentId)) {
      setMarkedStudents([...markedStudents, studentId]);
      toast.success('Attendance marked');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Faculty Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage classroom attendance and sessions.</p>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={HiClock} label="Classes Today" value={5} color="blue" />
        <StatCard icon={HiUsers} label="Students Marked" value={120} color="green" />
        <StatCard icon={HiCheckCircle} label="Sessions Today" value={2} color="purple" />
      </div>

      {/* Row 2: Session Alert */}
      {sessionActive && (
        <div className="mb-8">
          <AlertCard
            type="info"
            title="Session Active"
            message={`Attendance session is running. Timer: ${formatTime(timer)}`}
          />
        </div>
      )}

      {/* Row 3: Main Content - Camera & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Camera Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera Preview */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Live Camera Feed</h3>
              <p className="text-sm text-slate-500 mt-1">Face detection &amp; recognition</p>
            </div>
            <div className="bg-slate-50 aspect-video flex items-center justify-center relative">
              {sessionActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </>
              ) : (
                <div className="text-center">
                  <HiVideoCamera className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Camera will activate when session starts</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3">
              {!sessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <HiPlay className="w-5 h-5" />
                  Start Session
                </button>
              ) : (
                <>
                  <div className="flex-1 bg-red-100 border border-red-300 py-3 rounded-lg flex items-center justify-center gap-2 text-red-700 font-semibold">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    {formatTime(timer)}
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <HiStop className="w-5 h-5" />
                    End Session
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recognized Students */}
          {sessionActive && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Detected Students</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recognizedStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      markedStudents.includes(student.id)
                        ? 'bg-green-50 border-green-200'
                        : student.detected
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">ID: {student.id}</p>
                      {student.detected && (
                        <p className="text-xs text-green-600 mt-1">✓ Detected {Math.round(student.confidence * 100)}%</p>
                      )}
                    </div>
                    {student.detected && !markedStudents.includes(student.id) && (
                      <button
                        onClick={() => handleMarkAttendance(student.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Mark
                      </button>
                    )}
                    {markedStudents.includes(student.id) && (
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <HiCheckCircle className="w-5 h-5" />
                        Marked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Session Info */}
        <div className="space-y-6">
          {/* Session Summary */}
          {sessionActive && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Class</span>
                  <span className="font-semibold text-slate-900">CSE-8A</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Students</span>
                  <span className="font-semibold text-slate-900">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Marked Present</span>
                  <span className="font-semibold text-green-600">{markedStudents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Absent</span>
                  <span className="font-semibold text-red-500">{45 - markedStudents.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Today's Attendance */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Sessions</h3>
            <div className="space-y-3">
              {todayRecords.map((record, idx) => (
                <div key={idx} className="pb-3 border-b border-slate-200 last:pb-0 last:border-0">
                  <p className="font-medium text-slate-900 text-sm">{record.class}</p>
                  <p className="text-xs text-slate-500 mt-1">{record.time}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {record.marked}/{record.total}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Today's Records Table */}
      <DataTable
        title="Attendance Records"
        subtitle="Today's completed sessions"
        columns={recordsColumns}
        data={todayRecords}
      />
    </DashboardLayout>
  );
};

export default FacultyDashboard;
