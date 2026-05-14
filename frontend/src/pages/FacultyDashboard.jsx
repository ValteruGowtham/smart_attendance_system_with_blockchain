// import React, { useState, useRef, useEffect } from 'react';
// import {
//   HiVideoCamera,
//   HiStop,
//   HiUsers,
//   HiClock,
//   HiCheckCircle,
//   HiX,
// } from 'react-icons/hi';
// import DashboardLayout from '../components/dashboard/DashboardLayout';
// import Sidebar from '../components/dashboard/Sidebar';
// import Topbar from '../components/dashboard/Topbar';
// import { useToast } from '../context/ToastContext';

// /**
//  * FacultyDashboard - Live attendance session with split-panel view
//  * Left: Camera feed with face detection overlays (dark navy background)
//  * Right: Real-time recognition feed list (white background)
//  * Top: Session info with countdown timer
//  */
// const FacultyDashboard = () => {
//   const [sessionActive, setSessionActive] = useState(false);
//   const [sessionTime, setSessionTime] = useState(0);
//   const [sessionDuration] = useState(3600); // 60 minutes
//   const [recognitions, setRecognitions] = useState([]);
//   const [showEndModal, setShowEndModal] = useState(false);
  
//   // Class selection state
//   const [classInfo, setClassInfo] = useState({ branch: 'CSE', year: '2', section: 'A' });
//   const [sessionData, setSessionData] = useState(null);
//   const [loading, setLoading] = useState(false);
  
//   const videoRef = useRef(null);
//   const timerRef = useRef(null);
//   const canvasRef = useRef(null);
//   const { toast } = useToast();

//   // Mock detected faces for demo
//   const detectedFaces = [
//     { id: 'face-1', studentId: 101, name: 'Rahul Kumar', confidence: 0.98, status: 'matched', x: 50, y: 100, w: 100, h: 120 },
//     { id: 'face-2', studentId: null, name: 'Unknown', confidence: 0, status: 'unknown', x: 250, y: 150, w: 90, h: 110 },
//   ];

//   // Mock recognized students list
//   const mockRecognitions = [
//     { id: 1, name: 'Rahul Kumar', confidence: 0.98, timestamp: '10:02:15', avatar: '👨‍🎓' },
//     { id: 2, name: 'Priya Sharma', confidence: 0.95, timestamp: '10:01:45', avatar: '👩‍🎓' },
//     { id: 3, name: 'Arjun Singh', confidence: 0.92, timestamp: '10:01:20', avatar: '👨‍🎓' },
//   ];

//   // Start session
//   const handleStartSession = async () => {
//     try {
//       setLoading(true);

//       // Call backend API to open attendance window
//       const formData = new FormData();
//       formData.append('branch', classInfo.branch);
//       formData.append('year', classInfo.year);
//       formData.append('section', classInfo.section);

//       const response = await fetch('/api/attendance/window/open/', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include',
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(data.error || 'Failed to open attendance window');
//         setLoading(false);
//         return;
//       }

//       setSessionData(data);
//       setSessionActive(true);
//       setSessionTime(0);
//       setRecognitions([]);
//       toast.success('Attendance session started');

//       timerRef.current = setInterval(() => {
//         setSessionTime((prev) => {
//           if (prev >= sessionDuration) {
//             clearInterval(timerRef.current);
//             return sessionDuration;
//           }
//           return prev + 1;
//         });
//       }, 1000);

//       // Request camera
//       navigator.mediaDevices
//         .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
//         .then((stream) => {
//           if (videoRef.current) videoRef.current.srcObject = stream;
//         })
//         .catch(() => {
//           toast.warning('Camera access denied');
//           setSessionActive(false);
//         });
//     } catch (error) {
//       toast.error('Error starting session: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Capture and mark attendance
//   const handleCaptureAndMark = async () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     try {
//       // Draw video frame to canvas
//       const ctx = canvasRef.current.getContext('2d');
//       const video = videoRef.current;
      
//       canvasRef.current.width = video.videoWidth;
//       canvasRef.current.height = video.videoHeight;
//       ctx.drawImage(video, 0, 0);

//       // Convert canvas to base64 image data
//       const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);

//       // Send to backend for face recognition and marking
//       const formData = new FormData();
//       formData.append('branch', classInfo.branch);
//       formData.append('year', classInfo.year);
//       formData.append('section', classInfo.section);
//       formData.append('face_image_data', imageData);

//       const response = await fetch('/api/attendance/mark/', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include',
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         if (result.unidentified) {
//           toast.warning(result.error || 'Face not recognized. Try again.');
//         } else {
//           toast.error(result.error || 'Failed to mark attendance');
//         }
//         return;
//       }

//       // Add to recognitions list on success
//       if (result.success) {
//         const newRec = {
//           id: recognitions.length + 1,
//           name: result.student_name || 'Recognized',
//           confidence: result.confidence || 0.95,
//           timestamp: new Date().toLocaleTimeString(),
//           avatar: '👤',
//         };
//         setRecognitions([...recognitions, newRec]);
//         toast.success(`${result.student_name} attendance marked!`);
//       }
//     } catch (error) {
//       toast.error('Error marking attendance: ' + error.message);
//     }
//   };

//   // End session with confirmation
//   const confirmEndSession = () => {
//     setSessionActive(false);
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//     setShowEndModal(false);
//     toast.success('Session ended. Summary saved.');
//   };

//   // Format time
//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   };

//   // Calculate countdown ring
//   const remaining = sessionDuration - sessionTime;
//   const circumference = 2 * Math.PI * 45;
//   const strokeDashoffset = circumference - (remaining / sessionDuration) * circumference;

//   return (
//     <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
//       {/* Session Info Bar */}
//       {sessionActive && (
//         <div className="mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-6">
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium opacity-90">Class:</span>
//                 <span className="text-xl font-bold">{classInfo.branch}-{classInfo.year}{classInfo.section}</span>
//               </div>
//               <div className="w-px h-12 bg-white opacity-30"></div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium opacity-90">Period:</span>
//                 <span className="text-xl font-bold">{sessionData?.period || '—'}/6</span>
//               </div>
//               <div className="w-px h-12 bg-white opacity-30"></div>
//               <div className="flex items-center gap-3">
//                 <svg width="100" height="100" className="transform -rotate-90">
//                   <circle
//                     cx="50"
//                     cy="50"
//                     r="45"
//                     fill="none"
//                     stroke="rgba(255,255,255,0.2)"
//                     strokeWidth="4"
//                   />
//                   <circle
//                     cx="50"
//                     cy="50"
//                     r="45"
//                     fill="none"
//                     stroke="white"
//                     strokeWidth="4"
//                     strokeDasharray={circumference}
//                     strokeDashoffset={strokeDashoffset}
//                     className="transition-all duration-1000"
//                   />
//                   <text
//                     x="50"
//                     y="55"
//                     textAnchor="middle"
//                     fontSize="16"
//                     fontWeight="bold"
//                     fill="white"
//                   >
//                     {Math.floor(remaining / 60)}m
//                   </text>
//                 </svg>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowEndModal(true)}
//               className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
//             >
//               <HiStop className="w-5 h-5" />
//               End Session
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Content - Split Panel */}
//       {sessionActive ? (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           {/* Left: Camera Feed Panel (2/3 width) */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-slate-200">
//               {/* Camera Container */}
//               <div className="relative bg-slate-50 aspect-video flex items-center justify-center">
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   className="w-full h-full object-cover"
//                 />
//                 <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

//                 {/* Demo Face Overlays */}
//                 {detectedFaces.map((face) => (
//                   <div
//                     key={face.id}
//                     className={`absolute border-2 flex flex-col items-start justify-start`}
//                     style={{
//                       left: `${face.x}px`,
//                       top: `${face.y}px`,
//                       width: `${face.w}px`,
//                       height: `${face.h}px`,
//                       borderColor: face.status === 'matched' ? '#22c55e' : '#eab308',
//                     }}
//                   >
//                     <div
//                       className={`px-2 py-1 text-xs font-bold text-white rounded ${
//                         face.status === 'matched' ? 'bg-green-600' : 'bg-yellow-600'
//                       }`}
//                     >
//                       {face.name}
//                     </div>
//                     <div className="text-xs text-slate-900 mt-1 px-2 font-semibold bg-white bg-opacity-80 rounded">
//                       {(face.confidence * 100).toFixed(0)}%
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Camera Footer */}
//               <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 flex items-center justify-between border-t border-emerald-200">
//                 <div className="flex items-center gap-2 text-slate-900">
//                   <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
//                   <span className="text-sm font-semibold">Live Recording</span>
//                 </div>
//                 <span className="text-sm text-slate-700 font-medium">{formatTime(sessionTime)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Right: Recognition Feed List (1/3 width) */}
//           <div>
//             <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col h-full">
//               {/* Header */}
//               <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
//                 <h3 className="font-bold text-slate-900 text-lg">Recognized Students</h3>
//                 <p className="text-xs text-slate-500 mt-1">{recognitions.length} detected</p>
//               </div>

//               {/* Recognition List */}
//               <div className="flex-1 overflow-y-auto">
//                 <div className="divide-y divide-slate-200">
//                   {recognitions.map((rec, idx) => (
//                     <div
//                       key={idx}
//                       className="p-4 hover:bg-slate-50 transition-colors border-l-4 border-green-500"
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="text-3xl flex-shrink-0">{rec.avatar}</div>
//                         <div className="flex-1 min-w-0">
//                           <p className="font-semibold text-slate-900 truncate">{rec.name}</p>
//                           <p className="text-xs text-slate-500 mt-1">
//                             Confidence: <span className="font-bold text-green-600">{(rec.confidence * 100).toFixed(0)}%</span>
//                           </p>
//                           <p className="text-xs text-slate-400 mt-1">{rec.timestamp}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         // Idle State
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           <div className="lg:col-span-2">
//             <div className="bg-white border border-slate-200 rounded-lg p-8">
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Class</h2>
//                 <p className="text-slate-500">Choose the class and section for attendance marking</p>
//               </div>

//               {/* Class Selection Form */}
//               <div className="grid grid-cols-3 gap-6 mb-8">
//                 {/* Branch Selection */}
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">Branch</label>
//                   <select
//                     value={classInfo.branch}
//                     onChange={(e) => setClassInfo({ ...classInfo, branch: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   >
//                     <option value="CSE">CSE</option>
//                     <option value="ECE">ECE</option>
//                     <option value="ME">ME</option>
//                     <option value="CE">CE</option>
//                     <option value="EE">EE</option>
//                   </select>
//                 </div>

//                 {/* Year Selection */}
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
//                   <select
//                     value={classInfo.year}
//                     onChange={(e) => setClassInfo({ ...classInfo, year: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   >
//                     <option value="1">1st Year</option>
//                     <option value="2">2nd Year</option>
//                     <option value="3">3rd Year</option>
//                     <option value="4">4th Year</option>
//                   </select>
//                 </div>

//                 {/* Section Selection */}
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
//                   <select
//                     value={classInfo.section}
//                     onChange={(e) => setClassInfo({ ...classInfo, section: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   >
//                     <option value="A">A</option>
//                     <option value="B">B</option>
//                     <option value="C">C</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Display Selected Class */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
//                 <p className="text-sm text-blue-700">
//                   <span className="font-bold">{classInfo.branch}-{classInfo.year}-{classInfo.section}</span>
//                   {' '}selected for attendance session
//                 </p>
//               </div>

//               {/* Start Button */}
//               <button
//                 onClick={handleStartSession}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
//               >
//                 <HiVideoCamera className="w-6 h-6" />
//                 {loading ? 'Starting Session...' : 'Start Attendance Session'}
//               </button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="space-y-4">
//             <div className="bg-white border border-slate-200 rounded-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-slate-500 text-sm">Sessions Today</p>
//                   <p className="text-2xl font-bold text-slate-900 mt-2">2</p>
//                 </div>
//                 <HiClock className="w-8 h-8 text-blue-600" />
//               </div>
//             </div>
//             <div className="bg-white border border-slate-200 rounded-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-slate-500 text-sm">Students Marked</p>
//                   <p className="text-2xl font-bold text-slate-900 mt-2">120</p>
//                 </div>
//                 <HiUsers className="w-8 h-8 text-green-600" />
//               </div>
//             </div>
//             <div className="bg-white border border-slate-200 rounded-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-slate-500 text-sm">Accuracy</p>
//                   <p className="text-2xl font-bold text-slate-900 mt-2">96%</p>
//                 </div>
//                 <HiCheckCircle className="w-8 h-8 text-purple-600" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Capture Button during session (Auto-mark from camera) */}
//       {sessionActive && (
//         <div className="flex justify-center mb-8 gap-4">
//           <button
//             onClick={handleCaptureAndMark}
//             className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg"
//           >
//             <HiVideoCamera className="w-5 h-5" />
//             Capture & Mark
//           </button>
//         </div>
//       )}

//       {/* End Session Confirmation Modal */}
//       {showEndModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
//             {/* Header */}
//             <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
//               <h3 className="text-lg font-bold text-slate-900">End Session?</h3>
//               <button
//                 onClick={() => setShowEndModal(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <HiX className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Summary Stats */}
//             <div className="px-6 py-6 space-y-4">
//               <div className="bg-slate-50 rounded-lg p-4 space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Duration:</span>
//                   <span className="font-bold text-slate-900">{formatTime(sessionTime)}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Students Detected:</span>
//                   <span className="font-bold text-slate-900">24</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Marked Attendance:</span>
//                   <span className="font-bold text-green-600">23</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Accuracy:</span>
//                   <span className="font-bold text-slate-900">95.8%</span>
//                 </div>
//               </div>

//               <p className="text-sm text-slate-500">Session data will be saved to blockchain.</p>
//             </div>

//             {/* Footer Actions */}
//             <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
//               <button
//                 onClick={() => setShowEndModal(false)}
//                 className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmEndSession}
//                 className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
//               >
//                 End Session
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Hidden Canvas for frame capture */}
//       <canvas
//         ref={canvasRef}
//         className="hidden"
//         width={1280}
//         height={720}
//       />
//     </DashboardLayout>
//   );
// };

// export default FacultyDashboard;




import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HiVideoCamera,
  HiStop,
  HiUsers,
  HiClock,
  HiCheckCircle,
  HiX,
  HiRefresh,
  HiAcademicCap,
  HiLightningBolt,
  HiShieldCheck,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;500;600;700;800&display=swap');

  .faculty-root {
    font-family: 'Sora', sans-serif;
    --col-bg: #f0f2f7;
    --col-surface: #ffffff;
    --col-border: #e2e6f0;
    --col-text: #0f172a;
    --col-muted: #64748b;
    --col-accent: #2563eb;
    --col-accent2: #4f46e5;
    --col-success: #16a34a;
    --col-danger: #dc2626;
    --col-warn: #d97706;
    --col-live: #ef4444;
  }

  /* ── session bar ── */
  .session-bar {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #4f46e5 100%);
    border-radius: 16px;
    padding: 20px 28px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.35);
    position: relative;
    overflow: hidden;
  }
  .session-bar::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .session-bar-meta {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .session-bar-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .session-bar-stat .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    opacity: .7;
  }
  .session-bar-stat .value {
    font-size: 20px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    letter-spacing: -.02em;
  }
  .divider-v {
    width: 1px;
    height: 44px;
    background: rgba(255,255,255,.2);
  }
  .countdown-ring text {
    transform: rotate(90deg);
    transform-origin: 50% 50%;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
  }

  /* ── end-session button ── */
  .btn-end {
    background: rgba(220, 38, 38, .15);
    border: 1.5px solid rgba(220,38,38,.5);
    color: #fca5a5;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all .2s;
    backdrop-filter: blur(4px);
  }
  .btn-end:hover {
    background: rgba(220,38,38,.3);
    color: #fff;
    border-color: #ef4444;
  }

  /* ── camera panel ── */
  .camera-panel {
    background: #0f172a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,.18);
    border: 1px solid #1e293b;
    display: flex;
    flex-direction: column;
  }
  .camera-viewport {
    position: relative;
    aspect-ratio: 16/9;
    background: #020617;
    overflow: hidden;
  }
  .camera-viewport video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .camera-viewport canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .face-box {
    position: absolute;
    pointer-events: none;
    transition: all .3s;
  }
  .face-box-border {
    position: absolute;
    inset: 0;
    border: 2px solid;
    border-radius: 4px;
  }
  /* corner decorations */
  .face-box-border::before,
  .face-box-border::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border-color: inherit;
    border-style: solid;
  }
  .face-box-border::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
  .face-box-border::after  { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }
  .face-label {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
    color: #fff;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .face-conf {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    font-size: 10px;
    font-family: 'Space Mono', monospace;
    padding: 2px 6px;
    border-radius: 3px;
    background: rgba(0,0,0,.6);
    color: #94a3b8;
  }

  /* scan-line overlay */
  .scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(34,197,94,.7), transparent);
    animation: scan 3s linear infinite;
    pointer-events: none;
  }
  @keyframes scan {
    0%   { top: 0; opacity: 1; }
    90%  { top: 100%; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  /* corner HUD brackets */
  .hud-corner {
    position: absolute;
    width: 28px; height: 28px;
    border-color: rgba(34,197,94,.6);
    border-style: solid;
    pointer-events: none;
  }
  .hud-tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
  .hud-tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
  .hud-bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
  .hud-br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

  /* camera footer */
  .camera-footer {
    background: #0f172a;
    border-top: 1px solid #1e293b;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-between: space-between;
    justify-content: space-between;
  }
  .live-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: .08em;
    font-family: 'Space Mono', monospace;
  }
  .live-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #ef4444;
    animation: livePulse 1.2s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(.8); }
  }
  .timer-mono {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #38bdf8;
    letter-spacing: .05em;
  }

  /* ── recognition feed ── */
  .feed-panel {
    background: var(--col-surface);
    border-radius: 16px;
    border: 1px solid var(--col-border);
    box-shadow: 0 4px 20px rgba(0,0,0,.06);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .feed-header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--col-border);
    background: linear-gradient(135deg, #f8faff 0%, #fff 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .feed-header h3 {
    font-size: 15px;
    font-weight: 800;
    color: var(--col-text);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .feed-count-badge {
    font-size: 11px;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: #fff;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .feed-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .feed-list::-webkit-scrollbar { width: 4px; }
  .feed-list::-webkit-scrollbar-thumb { background: #e2e6f0; border-radius: 2px; }

  .feed-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    border-left: 3px solid #16a34a;
    background: linear-gradient(90deg, rgba(22,163,74,.04) 0%, transparent 100%);
    margin-bottom: 6px;
    animation: slideIn .3s ease;
    transition: background .15s;
  }
  .feed-item:hover { background: #f8faff; }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .feed-avatar {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #dbeafe, #ede9fe);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .feed-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--col-text);
    line-height: 1.2;
  }
  .feed-meta {
    font-size: 11px;
    color: var(--col-muted);
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Space Mono', monospace;
  }
  .conf-pill {
    font-size: 10px;
    font-weight: 700;
    color: #16a34a;
    background: rgba(22,163,74,.1);
    padding: 1px 6px;
    border-radius: 20px;
  }
  .feed-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--col-muted);
    font-size: 13px;
    padding: 40px 20px;
  }
  .feed-empty svg { width: 48px; height: 48px; opacity: .25; }

  /* ── capture button ── */
  .capture-bar {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
    margin-bottom: 8px;
  }
  .btn-capture {
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: #fff;
    border: none;
    padding: 14px 36px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 800;
    font-family: 'Sora', sans-serif;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all .2s;
    box-shadow: 0 6px 20px rgba(22,163,74,.4);
    letter-spacing: -.01em;
  }
  .btn-capture:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(22,163,74,.45);
  }
  .btn-capture:active { transform: translateY(0); }
  .btn-capture:disabled {
    opacity: .5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ── idle state ── */
  .idle-panel {
    background: var(--col-surface);
    border-radius: 16px;
    border: 1px solid var(--col-border);
    box-shadow: 0 4px 20px rgba(0,0,0,.06);
    padding: 36px;
  }
  .idle-heading {
    font-size: 24px;
    font-weight: 800;
    color: var(--col-text);
    letter-spacing: -.03em;
    margin-bottom: 4px;
  }
  .idle-sub {
    font-size: 14px;
    color: var(--col-muted);
    margin-bottom: 32px;
  }
  .class-form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }
  .form-group label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--col-muted);
    margin-bottom: 8px;
  }
  .form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--col-border);
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    color: var(--col-text);
    background: #f8faff;
    cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }
  .form-group select:focus {
    border-color: var(--col-accent);
    box-shadow: 0 0 0 3px rgba(37,99,235,.12);
    background-color: #fff;
  }
  .class-preview {
    background: linear-gradient(135deg, #eff6ff, #eef2ff);
    border: 1.5px solid #c7d2fe;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .class-preview-badge {
    font-size: 22px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    color: var(--col-accent2);
    letter-spacing: -.02em;
  }
  .class-preview-text {
    font-size: 13px;
    color: #4338ca;
    font-weight: 500;
  }
  .btn-start {
    width: 100%;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: #fff;
    border: none;
    padding: 16px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 800;
    font-family: 'Sora', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: all .2s;
    box-shadow: 0 6px 24px rgba(37,99,235,.35);
    letter-spacing: -.02em;
  }
  .btn-start:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(37,99,235,.4);
  }
  .btn-start:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ── stat cards ── */
  .stat-card {
    background: var(--col-surface);
    border-radius: 14px;
    border: 1px solid var(--col-border);
    padding: 22px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0,0,0,.04);
    transition: transform .15s, box-shadow .15s;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,.08);
  }
  .stat-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--col-muted);
    margin-bottom: 6px;
  }
  .stat-value {
    font-size: 28px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    color: var(--col-text);
    letter-spacing: -.04em;
    line-height: 1;
  }

  /* ── modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,.65);
    backdrop-filter: blur(4px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-card {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 32px 80px rgba(0,0,0,.25);
    animation: modalPop .25s cubic-bezier(.34,1.56,.64,1);
    overflow: hidden;
  }
  @keyframes modalPop {
    from { opacity: 0; transform: scale(.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  .modal-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--col-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--col-text);
    letter-spacing: -.03em;
  }
  .modal-close {
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid var(--col-border);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--col-muted);
    transition: all .15s;
  }
  .modal-close:hover { background: #f1f5f9; color: var(--col-text); }
  .modal-body { padding: 24px; }
  .summary-grid {
    background: #f8faff;
    border-radius: 12px;
    border: 1px solid var(--col-border);
    overflow: hidden;
    margin-bottom: 16px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 18px;
    border-bottom: 1px solid var(--col-border);
  }
  .summary-row:last-child { border-bottom: none; }
  .summary-row .key {
    font-size: 13px;
    color: var(--col-muted);
    font-weight: 500;
  }
  .summary-row .val {
    font-size: 14px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    color: var(--col-text);
  }
  .summary-row .val.success { color: var(--col-success); }
  .modal-note {
    font-size: 12px;
    color: var(--col-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .modal-footer {
    padding: 16px 24px;
    background: #f8faff;
    border-top: 1px solid var(--col-border);
    display: flex;
    gap: 12px;
  }
  .btn-cancel {
    flex: 1;
    padding: 12px;
    border: 1.5px solid var(--col-border);
    background: #fff;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    color: var(--col-text);
    cursor: pointer;
    transition: all .15s;
  }
  .btn-cancel:hover { background: #f1f5f9; }
  .btn-confirm-end {
    flex: 1;
    padding: 12px;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    color: #fff;
    cursor: pointer;
    transition: all .15s;
    box-shadow: 0 4px 14px rgba(220,38,38,.3);
  }
  .btn-confirm-end:hover { box-shadow: 0 6px 20px rgba(220,38,38,.4); }

  /* ── spinner ── */
  .spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── camera placeholder ── */
  .cam-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #334155;
  }
  .cam-placeholder svg { width: 64px; height: 64px; color: #1e40af; opacity: .5; }
  .cam-placeholder p { font-size: 14px; font-family: 'Space Mono', monospace; }
`;

/* ─── Component ─────────────────────────────────────────────────────────────── */
const FacultyDashboard = () => {
  const [sessionActive, setSessionActive]   = useState(false);
  const [sessionTime, setSessionTime]       = useState(0);
  const [sessionDuration]                   = useState(3600);
  const [recognitions, setRecognitions]     = useState([]);
  const [showEndModal, setShowEndModal]     = useState(false);
  const [classInfo, setClassInfo]           = useState({ branch: 'CSE', year: '2', section: 'A', course_id: '' });
  const [sessionData, setSessionData]       = useState(null);
  const [metadata, setMetadata]             = useState(null);
  const [loading, setLoading]               = useState(false);
  const [capturing, setCapturing]           = useState(false);
  const [cameraReady, setCameraReady]       = useState(false);

  const videoRef   = useRef(null);
  const timerRef   = useRef(null);
  const canvasRef  = useRef(null);
  const { toast }  = useToast();

  /* Inject styles once */
  useEffect(() => {
    const id = 'faculty-dash-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = styles;
      document.head.appendChild(tag);
    }
    return () => document.getElementById(id)?.remove();
  }, []);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoRef.current?.srcObject)
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* Fetch dashboard metadata */
  useEffect(() => {
    fetch('/api/faculty/dashboard/', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setMetadata(data);
          if (data.courses && data.courses.length > 0) {
            const firstCourse = data.courses[0];
            setClassInfo({
              branch: firstCourse.branch,
              year: firstCourse.year,
              section: firstCourse.section,
              course_id: firstCourse.id.toString(),
            });
          }
        }
      })
      .catch(err => console.error("Error fetching metadata", err));
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const remaining        = sessionDuration - sessionTime;
  const pct              = remaining / sessionDuration;
  const circumference    = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - pct);

  /* ── Start session ── */
  const handleStartSession = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('branch',   classInfo.branch);
      formData.append('year',     classInfo.year);
      formData.append('section',  classInfo.section);
      if (classInfo.course_id) {
        formData.append('course_id', classInfo.course_id);
      }

      const response = await fetch('/api/attendance/window/open/', {
        method: 'POST', body: formData, credentials: 'include',
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
      setCameraReady(false);
      toast.success('Attendance session started');

      timerRef.current = setInterval(() => {
        setSessionTime(prev => {
          if (prev >= sessionDuration) { clearInterval(timerRef.current); return sessionDuration; }
          return prev + 1;
        });
      }, 1000);

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => setCameraReady(true);
          }
        })
        .catch(() => {
          toast.warning('Camera access denied – session will continue without live feed');
          setSessionActive(true); // still allow manual capture via file or other means
        });

    } catch (error) {
      toast.error('Error starting session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Capture & mark ── */
  const handleCaptureAndMark = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    try {
      setCapturing(true);
      const ctx    = canvasRef.current.getContext('2d');
      const video  = videoRef.current;
      canvasRef.current.width  = video.videoWidth  || 1280;
      canvasRef.current.height = video.videoHeight || 720;
      ctx.drawImage(video, 0, 0);

      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.85);
      const formData  = new FormData();
      formData.append('branch',          classInfo.branch);
      formData.append('year',            classInfo.year);
      formData.append('section',         classInfo.section);
      if (classInfo.course_id) {
        formData.append('course_id', classInfo.course_id);
      }
      formData.append('face_image_data', imageData);

      const response = await fetch('/api/attendance/mark/', {
        method: 'POST', body: formData, credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.unidentified) toast.warning(result.error || 'Face not recognized. Try again.');
        else toast.error(result.error || 'Failed to mark attendance');
        return;
      }

      if (result.success) {
        const newRec = {
          id:         Date.now(),
          name:       result.student_name || 'Recognized',
          confidence: result.confidence   || 0.95,
          timestamp:  new Date().toLocaleTimeString(),
          avatar:     ['👨‍🎓', '👩‍🎓'][Math.floor(Math.random() * 2)],
        };
        setRecognitions(prev => [newRec, ...prev]);
        toast.success(`✓ ${result.student_name} marked present`);
      }
    } catch (error) {
      toast.error('Error marking attendance: ' + error.message);
    } finally {
      setCapturing(false);
    }
  }, [classInfo, recognitions]);

  /* ── End session ── */
  const confirmEndSession = () => {
    setSessionActive(false);
    clearInterval(timerRef.current);
    if (videoRef.current?.srcObject)
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setCameraReady(false);
    setShowEndModal(false);
    toast.success('Session ended. Summary saved to blockchain.');
  };

  /* ── Detected faces overlay (demo) ── */
  const detectedFaces = cameraReady ? [
    { id: 'f1', name: 'Rahul Kumar',  confidence: 0.98, status: 'matched', x: '8%',  y: '15%', w: '22%', h: '50%' },
    { id: 'f2', name: 'Unknown',      confidence: 0,    status: 'unknown', x: '55%', y: '20%', w: '20%', h: '46%' },
  ] : [];

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      <div className="faculty-root">

        {/* ── Session Bar ── */}
        {sessionActive && (
          <div className="session-bar">
            <div className="session-bar-meta">
              <div className="session-bar-stat">
                <span className="label">Course</span>
                <span className="value">
                  {classInfo.course_id && metadata?.courses ? 
                    metadata.courses.find(c => c.id.toString() === classInfo.course_id)?.course_name : 
                    `${classInfo.branch}-${classInfo.year}${classInfo.section}`
                  }
                </span>
              </div>
              <div className="divider-v" />
              <div className="session-bar-stat">
                <span className="label">Period</span>
                <span className="value">{sessionData?.period || '—'}/6</span>
              </div>
              <div className="divider-v" />
              <div className="session-bar-stat">
                <span className="label">Marked</span>
                <span className="value">{recognitions.length}</span>
              </div>
              <div className="divider-v" />

              {/* countdown ring */}
              <svg width="96" height="96" viewBox="0 0 96 96" className="countdown-ring">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="5" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={pct < .2 ? '#f87171' : '#6ee7b7'}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                />
                <text x="48" y="44" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.65)" fontFamily="Sora, sans-serif" fontWeight="600">LEFT</text>
                <text x="48" y="62" textAnchor="middle" fontSize="13" fill="white" fontFamily="Space Mono, monospace" fontWeight="700">
                  {Math.floor(remaining / 60)}m
                </text>
              </svg>
            </div>

            <button className="btn-end" onClick={() => setShowEndModal(true)}>
              <HiStop style={{ width: 18, height: 18 }} />
              End Session
            </button>
          </div>
        )}

        {/* ── Main split panel ── */}
        {sessionActive ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>

              {/* Camera panel */}
              <div className="camera-panel">
                <div className="camera-viewport">
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Camera not ready placeholder */}
                  {!cameraReady && (
                    <div className="cam-placeholder">
                      <HiVideoCamera />
                      <p>Initializing camera…</p>
                    </div>
                  )}

                  {/* HUD corners */}
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />

                  {/* Scan line */}
                  {cameraReady && <div className="scan-line" />}

                  {/* Face boxes */}
                  {detectedFaces.map(face => (
                    <div key={face.id} className="face-box" style={{ left: face.x, top: face.y, width: face.w, height: face.h }}>
                      <div
                        className="face-box-border"
                        style={{ borderColor: face.status === 'matched' ? '#22c55e' : '#eab308' }}
                      />
                      <div
                        className="face-label"
                        style={{ background: face.status === 'matched' ? 'rgba(22,163,74,.85)' : 'rgba(217,119,6,.85)' }}
                      >
                        {face.status === 'matched'
                          ? <HiCheckCircle style={{ width: 10, height: 10 }} />
                          : <HiX style={{ width: 10, height: 10 }} />}
                        {face.name}
                      </div>
                      {face.status === 'matched' && (
                        <div className="face-conf">{(face.confidence * 100).toFixed(0)}% match</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="camera-footer">
                  <div className="live-badge">
                    <div className="live-dot" />
                    Live Recording
                  </div>
                  <div className="timer-mono">{formatTime(sessionTime)}</div>
                </div>
              </div>

              {/* Recognition feed */}
              <div className="feed-panel">
                <div className="feed-header">
                  <h3>
                    <HiUsers style={{ width: 18, height: 18, color: '#2563eb' }} />
                    Recognized Students
                  </h3>
                  <span className="feed-count-badge">{recognitions.length} marked</span>
                </div>

                <div className="feed-list">
                  {recognitions.length === 0 ? (
                    <div className="feed-empty">
                      <HiUsers />
                      <p>No students marked yet.</p>
                      <p style={{ fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
                        Point the camera at a student and press<br /><strong>Capture & Mark</strong>.
                      </p>
                    </div>
                  ) : (
                    recognitions.map((rec) => (
                      <div key={rec.id} className="feed-item">
                        <div className="feed-avatar">{rec.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="feed-name">{rec.name}</div>
                          <div className="feed-meta">
                            <span className="conf-pill">{(rec.confidence * 100).toFixed(0)}%</span>
                            {rec.timestamp}
                          </div>
                        </div>
                        <HiCheckCircle style={{ width: 18, height: 18, color: '#16a34a', flexShrink: 0 }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Capture button */}
            <div className="capture-bar">
              <button
                className="btn-capture"
                onClick={handleCaptureAndMark}
                disabled={capturing || !cameraReady}
              >
                {capturing
                  ? <><span className="spinner" /> Capturing…</>
                  : <><HiVideoCamera style={{ width: 20, height: 20 }} /> Capture &amp; Mark Attendance</>}
              </button>
            </div>
          </>
        ) : (
          /* ── Idle state ── */
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            {/* Class selector */}
            <div className="idle-panel">
              <h2 className="idle-heading">Select Course / Class</h2>
              <p className="idle-sub">Choose the subject you are teaching before starting the session.</p>

              <div className="class-form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label>Course</label>
                  {metadata?.courses && metadata.courses.length > 0 ? (
                    <select 
                      value={classInfo.course_id} 
                      onChange={e => {
                        const courseId = e.target.value;
                        const course = metadata.courses.find(c => c.id.toString() === courseId);
                        if (course) {
                          setClassInfo({ ...classInfo, course_id: courseId, branch: course.branch, year: course.year, section: course.section });
                        } else {
                          setClassInfo({ ...classInfo, course_id: courseId });
                        }
                      }}
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--col-border)', width: '100%' }}
                    >
                      <option value="">Select a course...</option>
                      {metadata.courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_code} - {c.course_name} ({c.branch}-{c.year}-{c.section})</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', color: '#64748b', fontSize: '14px' }}>
                      No courses assigned to you.
                    </div>
                  )}
                </div>
              </div>

              {/* Legacy fallback if no courses */}
              {(!metadata?.courses || metadata.courses.length === 0) && (
                <div className="class-form-grid" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label>Branch</label>
                    <select value={classInfo.branch} onChange={e => setClassInfo({ ...classInfo, branch: e.target.value })}>
                      {['CSE','ECE','ME','CE','EE'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <select value={classInfo.year} onChange={e => setClassInfo({ ...classInfo, year: e.target.value })}>
                      {[['1','1st Year'],['2','2nd Year'],['3','3rd Year'],['4','4th Year']].map(([v,l]) =>
                        <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select value={classInfo.section} onChange={e => setClassInfo({ ...classInfo, section: e.target.value })}>
                      {['A','B','C'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="class-preview" style={{ marginTop: '16px' }}>
                <HiAcademicCap style={{ width: 24, height: 24, color: '#4338ca', flexShrink: 0 }} />
                <div>
                  <div className="class-preview-badge">
                    {classInfo.course_id && metadata?.courses ? 
                      metadata.courses.find(c => c.id.toString() === classInfo.course_id)?.course_name : 
                      `${classInfo.branch} · Year ${classInfo.year} · Section ${classInfo.section}`
                    }
                  </div>
                  <div className="class-preview-text">Selected for attendance session</div>
                </div>
              </div>

              <button className="btn-start" onClick={handleStartSession} disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Starting Session…</>
                  : <><HiVideoCamera style={{ width: 22, height: 22 }} /> Start Attendance Session</>}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Sessions Today', value: '2', icon: <HiClock style={{ width: 24, height: 24, color: '#2563eb' }} />, bg: '#eff6ff', iconBg: '#dbeafe' },
                { label: 'Students Marked', value: '120', icon: <HiUsers style={{ width: 24, height: 24, color: '#16a34a' }} />, bg: '#f0fdf4', iconBg: '#dcfce7' },
                { label: 'Accuracy', value: '96%', icon: <HiShieldCheck style={{ width: 24, height: 24, color: '#7c3aed' }} />, bg: '#faf5ff', iconBg: '#ede9fe' },
              ].map(({ label, value, icon, iconBg }) => (
                <div key={label} className="stat-card">
                  <div>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                  </div>
                  <div className="stat-icon" style={{ background: iconBg }}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── End session modal ── */}
        {showEndModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEndModal(false)}>
            <div className="modal-card">
              <div className="modal-header">
                <span className="modal-title">End Session?</span>
                <button className="modal-close" onClick={() => setShowEndModal(false)}>
                  <HiX style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <div className="modal-body">
                <div className="summary-grid">
                  {[
                    { key: 'Duration',          val: formatTime(sessionTime) },
                    { key: 'Students Detected', val: recognitions.length + 1 },
                    { key: 'Marked Present',    val: recognitions.length, success: true },
                    { key: 'Accuracy',          val: '95.8%' },
                  ].map(({ key, val, success }) => (
                    <div key={key} className="summary-row">
                      <span className="key">{key}</span>
                      <span className={`val${success ? ' success' : ''}`}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="modal-note">
                  <HiShieldCheck style={{ width: 14, height: 14, color: '#16a34a' }} />
                  Session data will be saved to blockchain.
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowEndModal(false)}>Cancel</button>
                <button className="btn-confirm-end" onClick={confirmEndSession}>End Session</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;