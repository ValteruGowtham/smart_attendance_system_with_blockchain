import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineVideoCamera,
  HiOutlinePlay,
  HiOutlineStop,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import { MainLayout } from '../components/layout';
import { Button, Card, CardHeader, CardContent, CardTitle, CardDescription, Select } from '../components/ui';
import { KPICard, AlertsList } from '../components/dashboard';
import { getFacultyDashboard, markAttendance, openAttendanceWindow } from '../api/api';
import { useToast } from '../context/ToastContext';

const FacultyDashboardModern = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [markedStudents, setMarkedStudents] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classes_today: 0,
    students_marked: 0,
    sessions_today: 0,
  });
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const { toast } = useToast();

  // Fetch faculty dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFacultyDashboard();
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer effect
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive]);

  // Start attendance session
  const handleStartSession = async () => {
    if (!selectedClass) {
      toast.warning('Please select a class first');
      return;
    }

    try {
      await openAttendanceWindow();
      setSessionActive(true);
      setCameraOn(true);
      setTimer(0);
      toast.success('Attendance session started');

      // Request camera access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast.warning('Camera access denied. Using manual mode.');
        setCameraOn(false);
      }
    } catch (err) {
      toast.error('Failed to start session');
    }
  };

  // End attendance session
  const handleEndSession = async () => {
    setSessionActive(false);
    setCameraOn(false);
    setTimer(0);
    setRecognizedStudents([]);
    setMarkedStudents([]);

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    toast.success('Attendance session ended');
  };

  // Mark attendance
  const handleMarkAttendance = async (studentId) => {
    try {
      await markAttendance({ student_id: studentId, status: 'Present' });
      setMarkedStudents((prev) => [...prev, studentId]);
      toast.success('Attendance marked');
    } catch (err) {
      toast.error('Failed to mark attendance');
    }
  };

  // Format timer
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Mock classes
  const classes = [
    { id: 1, name: '8-A (CSE)', time: '10:00 AM', students: 45 },
    { id: 2, name: '8-B (ECE)', time: '11:00 AM', students: 40 },
    { id: 3, name: '9-A (CSE)', time: '1:00 PM', students: 42 },
  ];

  // Mock recognized students
  const mockRecognizedStudents = [
    { id: 101, name: 'Rahul Kumar', detected: true, confidence: 0.98 },
    { id: 102, name: 'Priya Sharma', detected: true, confidence: 0.95 },
    { id: 103, name: 'Arjun Singh', detected: true, confidence: 0.92 },
    { id: 104, name: 'Neha Patel', detected: false, confidence: 0 },
    { id: 105, name: 'Amit Verma', detected: false, confidence: 0 },
  ];

  // Today's attendance records
  const todayRecords = [
    { id: 1, class: '8-A (CSE)', time: '10:30 AM', marked: 42, absent: 3 },
    { id: 2, class: '8-B (ECE)', time: '11:45 AM', marked: 38, absent: 2 },
  ];

  const alerts = [];
  if (sessionActive) {
    alerts.push({
      id: 1,
      type: 'info',
      title: 'Session Active',
      message: `Attendance session running for ${selectedClass}. Session timer: ${formatTime(timer)}`,
    });
  }

  return (
    <MainLayout pageTitle="Faculty Dashboard">
      {/* KPI Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          icon={HiOutlineCalendar}
          label="Classes Today"
          value={stats.classes_today}
          color="blue"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineUserGroup}
          label="Students Marked"
          value={stats.students_marked}
          color="green"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineClock}
          label="Sessions Today"
          value={stats.sessions_today}
          color="purple"
          loading={loading}
        />
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mb-8">
          <AlertsList alerts={alerts} />
        </section>
      )}

      {/* Main Session Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Session Controls & Camera */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Class</CardTitle>
              <CardDescription>Choose class to start attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Camera Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Camera Feed</CardTitle>
              <CardDescription>Face detection & recognition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessionActive ? (
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg aspect-video flex flex-col items-center justify-center text-gray-500">
                    <HiOutlineVideoCamera size={48} className="opacity-20 mb-2" />
                    <p>Camera inactive - Start session to begin</p>
                  </div>
                )}

                {/* Session Controls */}
                <div className="flex gap-3">
                  {!sessionActive ? (
                    <Button
                      variant="success"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={handleStartSession}
                      disabled={!selectedClass}
                    >
                      <HiOutlinePlay size={18} />
                      Start Session
                    </Button>
                  ) : (
                    <>
                      <div className="flex-1 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center justify-center gap-2 text-red-600 font-semibold">
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                          <div className="w-3 h-3 bg-red-600 rounded-full" />
                        </motion.div>
                        {formatTime(timer)}
                      </div>
                      <Button
                        variant="danger"
                        className="flex items-center justify-center gap-2"
                        onClick={handleEndSession}
                      >
                        <HiOutlineStop size={18} />
                        End Session
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recognized Students */}
          {sessionActive && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Students</CardTitle>
                <CardDescription>Real-time face recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockRecognizedStudents.map((student, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        markedStudents.includes(student.id)
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                          : student.detected
                          ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">ID: {student.id}</p>
                        {student.detected && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Detected {Math.round(student.confidence * 100)}%
                          </p>
                        )}
                      </div>
                      {student.detected && !markedStudents.includes(student.id) && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMarkAttendance(student.id)}
                        >
                          Mark Present
                        </Button>
                      )}
                      {markedStudents.includes(student.id) && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                          <HiOutlineCheckCircle size={20} />
                          Marked
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Session Summary */}
          {sessionActive && (
            <Card>
              <CardHeader>
                <CardTitle>Session Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Class</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {classes.find((c) => String(c.id) === selectedClass)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Total Students</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {classes.find((c) => String(c.id) === selectedClass)?.students}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Marked Present</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{markedStudents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Absent</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {(classes.find((c) => String(c.id) === selectedClass)?.students || 0) - markedStudents.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayRecords.map((record, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{record.class}</p>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{record.time}</span>
                      <div className="flex gap-2">
                        <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                          {record.marked} Present
                        </span>
                        <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                          {record.absent} Absent
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg Attendance</span>
                  <span className="font-bold text-gray-900 dark:text-white">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Classes Handled</span>
                  <span className="font-bold text-gray-900 dark:text-white">285</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">This Month</span>
                  <span className="font-bold text-gray-900 dark:text-white">42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FacultyDashboardModern;
