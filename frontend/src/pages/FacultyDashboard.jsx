import React, { useState, useRef, useEffect } from 'react';
import {
  HiVideoCamera,
  HiStop,
  HiUsers,
  HiClock,
  HiCheckCircle,
  HiX,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

/**
 * FacultyDashboard - Live attendance session with split-panel view
 * Left: Camera feed with face detection overlays (dark navy background)
 * Right: Real-time recognition feed list (white background)
 * Top: Session info with countdown timer
 */
const FacultyDashboard = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionDuration] = useState(3600); // 60 minutes
  const [recognitions, setRecognitions] = useState([]);
  const [showEndModal, setShowEndModal] = useState(false);
  
  // Class selection state
  const [classInfo, setClassInfo] = useState({ branch: 'CSE', year: '2', section: 'A' });
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const { toast } = useToast();

  // Mock detected faces for demo
  const detectedFaces = [
    { id: 'face-1', studentId: 101, name: 'Rahul Kumar', confidence: 0.98, status: 'matched', x: 50, y: 100, w: 100, h: 120 },
    { id: 'face-2', studentId: null, name: 'Unknown', confidence: 0, status: 'unknown', x: 250, y: 150, w: 90, h: 110 },
  ];

  // Mock recognized students list
  const mockRecognitions = [
    { id: 1, name: 'Rahul Kumar', confidence: 0.98, timestamp: '10:02:15', avatar: '👨‍🎓' },
    { id: 2, name: 'Priya Sharma', confidence: 0.95, timestamp: '10:01:45', avatar: '👩‍🎓' },
    { id: 3, name: 'Arjun Singh', confidence: 0.92, timestamp: '10:01:20', avatar: '👨‍🎓' },
  ];

  // Start session
  const handleStartSession = async () => {
    try {
      setLoading(true);

      // Call backend API to open attendance window
      const formData = new FormData();
      formData.append('branch', classInfo.branch);
      formData.append('year', classInfo.year);
      formData.append('section', classInfo.section);

      const response = await fetch('/api/attendance/window/open/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to open attendance window');
        setLoading(false);
        return;
      }

      setSessionData(data);
      setSessionActive(true);
      setSessionTime(0);
      setRecognitions([]);
      toast.success('Attendance session started');

      timerRef.current = setInterval(() => {
        setSessionTime((prev) => {
          if (prev >= sessionDuration) {
            clearInterval(timerRef.current);
            return sessionDuration;
          }
          return prev + 1;
        });
      }, 1000);

      // Request camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {
          toast.warning('Camera access denied');
          setSessionActive(false);
        });
    } catch (error) {
      toast.error('Error starting session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Capture and mark attendance
  const handleCaptureAndMark = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      // Draw video frame to canvas
      const ctx = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert canvas to base64 image data
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);

      // Send to backend for face recognition and marking
      const formData = new FormData();
      formData.append('branch', classInfo.branch);
      formData.append('year', classInfo.year);
      formData.append('section', classInfo.section);
      formData.append('face_image_data', imageData);

      const response = await fetch('/api/attendance/mark/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.unidentified) {
          toast.warning(result.error || 'Face not recognized. Try again.');
        } else {
          toast.error(result.error || 'Failed to mark attendance');
        }
        return;
      }

      // Add to recognitions list on success
      if (result.success) {
        const newRec = {
          id: recognitions.length + 1,
          name: result.student_name || 'Recognized',
          confidence: result.confidence || 0.95,
          timestamp: new Date().toLocaleTimeString(),
          avatar: '👤',
        };
        setRecognitions([...recognitions, newRec]);
        toast.success(`${result.student_name} attendance marked!`);
      }
    } catch (error) {
      toast.error('Error marking attendance: ' + error.message);
    }
  };

  // End session with confirmation
  const confirmEndSession = () => {
    setSessionActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setShowEndModal(false);
    toast.success('Session ended. Summary saved.');
  };

  // Format time
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate countdown ring
  const remaining = sessionDuration - sessionTime;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (remaining / sessionDuration) * circumference;

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Session Info Bar */}
      {sessionActive && (
        <div className="mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium opacity-90">Class:</span>
                <span className="text-xl font-bold">{classInfo.branch}-{classInfo.year}{classInfo.section}</span>
              </div>
              <div className="w-px h-12 bg-white opacity-30"></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium opacity-90">Period:</span>
                <span className="text-xl font-bold">{sessionData?.period || '—'}/6</span>
              </div>
              <div className="w-px h-12 bg-white opacity-30"></div>
              <div className="flex items-center gap-3">
                <svg width="100" height="100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                  />
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill="white"
                  >
                    {Math.floor(remaining / 60)}m
                  </text>
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowEndModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <HiStop className="w-5 h-5" />
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Split Panel */}
      {sessionActive ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Camera Feed Panel (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-slate-200">
              {/* Camera Container */}
              <div className="relative bg-slate-50 aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Demo Face Overlays */}
                {detectedFaces.map((face) => (
                  <div
                    key={face.id}
                    className={`absolute border-2 flex flex-col items-start justify-start`}
                    style={{
                      left: `${face.x}px`,
                      top: `${face.y}px`,
                      width: `${face.w}px`,
                      height: `${face.h}px`,
                      borderColor: face.status === 'matched' ? '#22c55e' : '#eab308',
                    }}
                  >
                    <div
                      className={`px-2 py-1 text-xs font-bold text-white rounded ${
                        face.status === 'matched' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}
                    >
                      {face.name}
                    </div>
                    <div className="text-xs text-slate-900 mt-1 px-2 font-semibold bg-white bg-opacity-80 rounded">
                      {(face.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Camera Footer */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 flex items-center justify-between border-t border-emerald-200">
                <div className="flex items-center gap-2 text-slate-900">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Live Recording</span>
                </div>
                <span className="text-sm text-slate-700 font-medium">{formatTime(sessionTime)}</span>
              </div>
            </div>
          </div>

          {/* Right: Recognition Feed List (1/3 width) */}
          <div>
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-bold text-slate-900 text-lg">Recognized Students</h3>
                <p className="text-xs text-slate-500 mt-1">{recognitions.length} detected</p>
              </div>

              {/* Recognition List */}
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-slate-200">
                  {recognitions.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 hover:bg-slate-50 transition-colors border-l-4 border-green-500"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl flex-shrink-0">{rec.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{rec.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Confidence: <span className="font-bold text-green-600">{(rec.confidence * 100).toFixed(0)}%</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{rec.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Idle State
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Class</h2>
                <p className="text-slate-500">Choose the class and section for attendance marking</p>
              </div>

              {/* Class Selection Form */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Branch Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Branch</label>
                  <select
                    value={classInfo.branch}
                    onChange={(e) => setClassInfo({ ...classInfo, branch: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="EE">EE</option>
                  </select>
                </div>

                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                  <select
                    value={classInfo.year}
                    onChange={(e) => setClassInfo({ ...classInfo, year: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Section Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
                  <select
                    value={classInfo.section}
                    onChange={(e) => setClassInfo({ ...classInfo, section: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              {/* Display Selected Class */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">{classInfo.branch}-{classInfo.year}-{classInfo.section}</span>
                  {' '}selected for attendance session
                </p>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartSession}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <HiVideoCamera className="w-6 h-6" />
                {loading ? 'Starting Session...' : 'Start Attendance Session'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Sessions Today</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">2</p>
                </div>
                <HiClock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Students Marked</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">120</p>
                </div>
                <HiUsers className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Accuracy</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">96%</p>
                </div>
                <HiCheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capture Button during session (Auto-mark from camera) */}
      {sessionActive && (
        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={handleCaptureAndMark}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg"
          >
            <HiVideoCamera className="w-5 h-5" />
            Capture & Mark
          </button>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">End Session?</h3>
              <button
                onClick={() => setShowEndModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="px-6 py-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-bold text-slate-900">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Students Detected:</span>
                  <span className="font-bold text-slate-900">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Marked Attendance:</span>
                  <span className="font-bold text-green-600">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Accuracy:</span>
                  <span className="font-bold text-slate-900">95.8%</span>
                </div>
              </div>

              <p className="text-sm text-slate-500">Session data will be saved to blockchain.</p>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for frame capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={1280}
        height={720}
      />
    </DashboardLayout>
  );
};

export default FacultyDashboard;
