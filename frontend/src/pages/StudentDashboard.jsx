// import React, { useState, useEffect } from 'react';
// import {
//   HiCheckCircle,
//   HiCalendar,
//   HiTrendingUp,
//   HiClock,
//   HiDownload,
//   HiExclamation,
// } from 'react-icons/hi';
// import DashboardLayout from '../components/dashboard/DashboardLayout';
// import Sidebar from '../components/dashboard/Sidebar';
// import Topbar from '../components/dashboard/Topbar';
// import { useToast } from '../context/ToastContext';

// /**
//  * StudentDashboard - Personal attendance analytics app
//  * Large circular progress ring, subject-wise bars, calendar heatmap, timeline
//  */
// const StudentDashboard = () => {
//   const [attendance, setAttendance] = useState({
//     present: 76,
//     absent: 24,
//     percentage: 76,
//   });

//   const { toast } = useToast();

//   // Subject-wise breakdown
//   const subjectBreakdown = [
//     { name: 'Mathematics', present: 32, absent: 8, percentage: 80 },
//     { name: 'Physics', present: 28, absent: 12, percentage: 70 },
//     { name: 'Chemistry', present: 35, absent: 5, percentage: 88 },
//     { name: 'Programming', present: 38, absent: 2, percentage: 95 },
//   ];

//   // Attendance records (last 10)
//   const attendanceRecords = [
//     { date: '2024-12-20', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh', time: '10:30 AM' },
//     { date: '2024-12-19', subject: 'Physics', status: 'Absent', faculty: 'Dr. Kumar', time: '09:00 AM' },
//     { date: '2024-12-18', subject: 'Chemistry', status: 'Present', faculty: 'Dr. Sharma', time: '11:00 AM' },
//     { date: '2024-12-17', subject: 'Programming', status: 'Present', faculty: 'Mr. Gupta', time: '02:00 PM' },
//     { date: '2024-12-16', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh', time: '10:30 AM' },
//     { date: '2024-12-15', subject: 'Physics', status: 'Present', faculty: 'Dr. Kumar', time: '09:00 AM' },
//     { date: '2024-12-14', subject: 'Chemistry', status: 'Absent', faculty: 'Dr. Sharma', time: '11:00 AM' },
//     { date: '2024-12-13', subject: 'Programming', status: 'Present', faculty: 'Mr. Gupta', time: '02:00 PM' },
//     { date: '2024-12-12', subject: 'Mathematics', status: 'Present', faculty: 'Dr. Singh', time: '10:30 AM' },
//     { date: '2024-12-11', subject: 'Physics', status: 'Present', faculty: 'Dr. Kumar', time: '09:00 AM' },
//   ];

//   // Generate calendar heatmap data for past 3 months (simplified)
//   const generateHeatmapData = () => {
//     const data = [];
//     const today = new Date();
//     for (let i = 90; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(date.getDate() - i);
//       const isPresent = Math.random() > 0.3; // 70% present
//       const noClass = Math.random() > 0.8; // 20% no class
//       data.push({
//         date: date.toISOString().split('T')[0],
//         status: noClass ? 'no-class' : isPresent ? 'present' : 'absent',
//       });
//     }
//     return data;
//   };

//   const heatmapData = generateHeatmapData();

//   // Get status color
//   const getAttendanceStatus = (percentage) => {
//     if (percentage >= 75) return { color: 'green', label: 'Good Standing', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
//     if (percentage >= 65) return { color: 'amber', label: 'At Risk', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
//     return { color: 'red', label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
//   };

//   const status = getAttendanceStatus(attendance.percentage);

//   // Handle download certificate
//   const handleDownloadCertificate = () => {
//     toast.success('Certificate download started');
//     // In real app, this would trigger API call
//   };

//   // Calculate progress ring
//   const circumference = 2 * Math.PI * 70;
//   const strokeDashoffset = circumference - (attendance.percentage / 100) * circumference;

//   return (
//     <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
//       {/* Page Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
//         <p className="text-slate-500 mt-1">Track your attendance and academic progress.</p>
//       </div>

//       {/* Row 1: Large Circular Progress Ring */}
//       <div className="bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
//         <div className="flex items-center justify-between">
//           {/* Circular Progress */}
//           <div className="flex flex-col items-center flex-1">
//             <svg width="280" height="280" className="transform -rotate-90">
//               <circle
//                 cx="140"
//                 cy="140"
//                 r="70"
//                 fill="none"
//                 stroke="#e2e8f0"
//                 strokeWidth="8"
//               />
//               <circle
//                 cx="140"
//                 cy="140"
//                 r="70"
//                 fill="none"
//                 stroke={status.color === 'green' ? '#16a34a' : status.color === 'amber' ? '#d97706' : '#dc2626'}
//                 strokeWidth="8"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={strokeDashoffset}
//                 strokeLinecap="round"
//                 className="transition-all duration-1000"
//               />
//               <text
//                 x="140"
//                 y="140"
//                 textAnchor="middle"
//                 dominantBaseline="middle"
//                 fontSize="48"
//                 fontWeight="bold"
//                 fill="#1e293b"
//               >
//                 {attendance.percentage}%
//               </text>
//               <text
//                 x="140"
//                 y="160"
//                 textAnchor="middle"
//                 dominantBaseline="middle"
//                 fontSize="14"
//                 fill="#64748b"
//               >
//                 Attendance
//               </text>
//             </svg>
//           </div>

//           {/* Status Info */}
//           <div className={`${status.bg} border ${status.border} rounded-lg p-6 flex-1 ml-8`}>
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <p className={`text-sm font-semibold ${status.text}`}>{status.label}</p>
//                 <p className="text-slate-700 text-lg font-bold mt-2">{attendance.percentage}% Attendance</p>
//               </div>
//               {attendance.percentage >= 75 ? (
//                 <HiCheckCircle className={`w-8 h-8 ${status.text}`} />
//               ) : (
//                 <HiExclamation className={`w-8 h-8 ${status.text}`} />
//               )}
//             </div>

//             <div className="space-y-3 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-slate-600">Total Classes:</span>
//                 <span className="font-semibold text-slate-900">{attendance.present + attendance.absent}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-600">Present:</span>
//                 <span className="font-semibold text-green-600">{attendance.present}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-600">Absent:</span>
//                 <span className="font-semibold text-red-600">{attendance.absent}</span>
//               </div>
//               <div className="pt-3 border-t border-current opacity-20">
//                 <span className="text-slate-600">Required:</span>
//                 <span className="ml-2 font-semibold text-slate-900">75%</span>
//               </div>
//             </div>

//             {/* Certificate Download Button */}
//             {attendance.percentage >= 75 && (
//               <button
//                 onClick={handleDownloadCertificate}
//                 className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
//               >
//                 <HiDownload className="w-5 h-5" />
//                 Download Certificate
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Subject-wise Attendance */}
//       <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
//         <h3 className="text-lg font-bold text-slate-900 mb-6">Subject-wise Attendance</h3>
//         <div className="space-y-5">
//           {subjectBreakdown.map((subject, idx) => {
//             const subjectStatus = subject.percentage >= 75 ? 'green' : subject.percentage >= 65 ? 'amber' : 'red';
//             const colorMap = {
//               green: 'bg-green-600',
//               amber: 'bg-amber-500',
//               red: 'bg-red-600',
//             };
//             return (
//               <div key={idx}>
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-3">
//                     <span className="font-semibold text-slate-900">{subject.name}</span>
//                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
//                       {subject.present}/{subject.present + subject.absent}
//                     </span>
//                   </div>
//                   <span className={`font-bold text-sm ${subjectStatus === 'green' ? 'text-green-600' : subjectStatus === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
//                     {subject.percentage}%
//                   </span>
//                 </div>
//                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
//                   <div
//                     className={`h-full ${colorMap[subjectStatus]} transition-all duration-300`}
//                     style={{ width: `${subject.percentage}%` }}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Row 3: Calendar Heatmap */}
//       <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
//         <h3 className="text-lg font-bold text-slate-900 mb-4">Attendance Heatmap (Last 3 Months)</h3>
//         <div className="flex gap-1 flex-wrap">
//           {heatmapData.map((day, idx) => {
//             let color = 'bg-slate-100';
//             if (day.status === 'present') color = 'bg-green-400';
//             else if (day.status === 'absent') color = 'bg-red-400';
//             else color = 'bg-slate-50 border border-slate-200';

//             return (
//               <div
//                 key={idx}
//                 className={`w-6 h-6 rounded ${color} cursor-pointer hover:ring-2 hover:ring-slate-400 transition-all`}
//                 title={`${day.date}: ${day.status}`}
//               />
//             );
//           })}
//         </div>
//         <div className="flex gap-4 mt-6 text-sm">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-green-400 rounded"></div>
//             <span className="text-slate-600">Present</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-red-400 rounded"></div>
//             <span className="text-slate-600">Absent</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded"></div>
//             <span className="text-slate-600">No Class</span>
//           </div>
//         </div>
//       </div>

//       {/* Row 4: Attendance Timeline */}
//       <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
//         <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Attendance (Last 10)</h3>
//         <div className="space-y-3">
//           {attendanceRecords.map((record, idx) => (
//             <div
//               key={idx}
//               className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-colors ${
//                 record.status === 'Present'
//                   ? 'bg-green-50 border-green-500 hover:bg-green-100'
//                   : 'bg-red-50 border-red-500 hover:bg-red-100'
//               }`}
//             >
//               {/* Date */}
//               <div className="min-w-fit">
//                 <p className="text-xs text-slate-500 font-semibold">
//                   {new Date(record.date).toLocaleDateString('en-US', {
//                     month: 'short',
//                     day: 'numeric',
//                   })}
//                 </p>
//                 <p className="text-xs text-slate-600">{record.time}</p>
//               </div>

//               {/* Content */}
//               <div className="flex-1 min-w-0">
//                 <p className="font-semibold text-slate-900">{record.subject}</p>
//                 <p className="text-xs text-slate-500 mt-1">Faculty: {record.faculty}</p>
//               </div>

//               {/* Status Badge */}
//               <div className="flex-shrink-0">
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
//                     record.status === 'Present'
//                       ? 'bg-green-200 text-green-700'
//                       : 'bg-red-200 text-red-700'
//                   }`}
//                 >
//                   {record.status === 'Present' ? (
//                     <HiCheckCircle className="w-4 h-4" />
//                   ) : (
//                     <HiExclamation className="w-4 h-4" />
//                   )}
//                   {record.status}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default StudentDashboard;




import React, { useState, useEffect, useCallback } from 'react';
import {
  HiCheckCircle,
  HiExclamation,
  HiDownload,
  HiRefresh,
  HiChevronRight,
  HiArrowLeft,
  HiCalendar,
  HiBookOpen,
  HiClipboardList,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

/* ─── Styles ────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .sd-root {
    font-family: 'Outfit', sans-serif;
    --c-bg:        #f4f6fb;
    --c-surface:   #ffffff;
    --c-border:    #e4e9f2;
    --c-text:      #0d1526;
    --c-muted:     #6b7a99;
    --c-accent:    #3b5bdb;
    --c-green:     #099268;
    --c-red:       #c92a2a;
    --c-amber:     #e67700;
    --c-mono:      'DM Mono', monospace;
    min-height: 100vh;
  }

  /* ── page header ── */
  .sd-page-header {
    margin-bottom: 28px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  .sd-page-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--c-text);
    letter-spacing: -.04em;
    line-height: 1.1;
  }
  .sd-page-sub {
    font-size: 14px;
    color: var(--c-muted);
    margin-top: 4px;
    font-weight: 400;
  }
  .btn-refresh {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    color: var(--c-muted);
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: 9px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all .18s;
  }
  .btn-refresh:hover { border-color: var(--c-accent); color: var(--c-accent); }
  .btn-refresh.spinning svg { animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── card base ── */
  .sd-card {
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: 18px;
    box-shadow: 0 2px 16px rgba(0,0,0,.05);
    overflow: hidden;
  }
  .sd-card-header {
    padding: 20px 24px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sd-card-title {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--c-muted);
  }

  /* ── overview row ── */
  .sd-overview {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 32px;
    align-items: center;
    padding: 32px;
  }
  @media (max-width: 720px) {
    .sd-overview { grid-template-columns: 1fr; justify-items: center; }
  }

  /* progress ring */
  .ring-wrap {
    position: relative;
    width: 200px;
    height: 200px;
    flex-shrink: 0;
  }
  .ring-wrap svg { display: block; }
  .ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .ring-pct {
    font-size: 42px;
    font-weight: 900;
    font-family: var(--c-mono);
    letter-spacing: -.05em;
    line-height: 1;
  }
  .ring-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--c-muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-top: 4px;
  }

  /* status panel */
  .status-panel {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
  }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 16px;
    width: fit-content;
  }
  .status-badge.good   { background: #d3f9d8; color: #2f9e44; }
  .status-badge.risk   { background: #fff3bf; color: #e67700; }
  .status-badge.crit   { background: #ffe3e3; color: #c92a2a; }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--c-border);
    font-size: 14px;
  }
  .stat-row:last-child { border-bottom: none; }
  .stat-row .sk { color: var(--c-muted); font-weight: 500; }
  .stat-row .sv { font-weight: 700; font-family: var(--c-mono); color: var(--c-text); }
  .stat-row .sv.green { color: var(--c-green); }
  .stat-row .sv.red   { color: var(--c-red);   }
  .stat-row .sv.amber { color: var(--c-amber);  }

  .btn-cert {
    margin-top: 20px;
    width: 100%;
    background: linear-gradient(135deg, #099268, #087f5b);
    color: #fff;
    border: none;
    border-radius: 11px;
    padding: 13px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all .18s;
    box-shadow: 0 4px 16px rgba(9,146,104,.3);
  }
  .btn-cert:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(9,146,104,.35); }

  /* ── view toggle ── */
  .view-toggle {
    display: flex;
    background: #f0f2f9;
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
  }
  .view-tab {
    padding: 7px 18px;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    color: var(--c-muted);
    cursor: pointer;
    transition: all .18s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .view-tab.active {
    background: var(--c-surface);
    color: var(--c-accent);
    box-shadow: 0 1px 6px rgba(0,0,0,.1);
  }

  /* ── subjects grid ── */
  .subjects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
    padding: 20px 24px 24px;
  }
  .subject-card {
    border: 1.5px solid var(--c-border);
    border-radius: 14px;
    padding: 18px 20px;
    cursor: pointer;
    transition: all .18s;
    position: relative;
    overflow: hidden;
    background: #fafbfe;
  }
  .subject-card:hover {
    border-color: var(--c-accent);
    box-shadow: 0 4px 20px rgba(59,91,219,.1);
    transform: translateY(-2px);
  }
  .subject-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 14px 14px 0 0;
  }
  .subject-card.green::before { background: linear-gradient(90deg, #099268, #20c997); }
  .subject-card.amber::before { background: linear-gradient(90deg, #e67700, #ffa94d); }
  .subject-card.red::before   { background: linear-gradient(90deg, #c92a2a, #ff6b6b); }

  .sc-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text);
    margin-bottom: 4px;
    padding-right: 40px;
  }
  .sc-faculty {
    font-size: 12px;
    color: var(--c-muted);
    margin-bottom: 14px;
  }
  .sc-pct {
    font-size: 32px;
    font-weight: 900;
    font-family: var(--c-mono);
    letter-spacing: -.04em;
    line-height: 1;
    margin-bottom: 10px;
  }
  .sc-pct.green { color: var(--c-green); }
  .sc-pct.amber { color: var(--c-amber); }
  .sc-pct.red   { color: var(--c-red);   }

  .sc-bar-track {
    height: 6px;
    background: #e9ecf5;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .sc-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }
  .sc-bar-fill.green { background: linear-gradient(90deg, #099268, #20c997); }
  .sc-bar-fill.amber { background: linear-gradient(90deg, #e67700, #ffa94d); }
  .sc-bar-fill.red   { background: linear-gradient(90deg, #c92a2a, #ff6b6b); }

  .sc-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--c-muted);
    font-family: var(--c-mono);
  }
  .sc-arrow {
    position: absolute;
    top: 18px;
    right: 16px;
    color: var(--c-muted);
    opacity: .4;
    transition: opacity .15s;
  }
  .subject-card:hover .sc-arrow { opacity: 1; color: var(--c-accent); }
  .sc-status-chip {
    position: absolute;
    bottom: 16px;
    right: 16px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 2px 8px;
    border-radius: 20px;
  }
  .sc-status-chip.green { background: #d3f9d8; color: #2f9e44; }
  .sc-status-chip.amber { background: #fff3bf; color: #e67700; }
  .sc-status-chip.red   { background: #ffe3e3; color: #c92a2a; }

  /* ── subject detail view ── */
  .detail-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--c-border);
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .btn-back {
    width: 36px; height: 36px;
    border-radius: 9px;
    border: 1.5px solid var(--c-border);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--c-muted);
    transition: all .15s;
    flex-shrink: 0;
  }
  .btn-back:hover { border-color: var(--c-accent); color: var(--c-accent); }
  .detail-title { font-size: 18px; font-weight: 800; color: var(--c-text); letter-spacing: -.03em; }
  .detail-sub   { font-size: 13px; color: var(--c-muted); font-weight: 400; }
  .detail-pct-pill {
    margin-left: auto;
    font-size: 22px;
    font-weight: 900;
    font-family: var(--c-mono);
    padding: 4px 16px;
    border-radius: 10px;
  }
  .detail-pct-pill.green { background: #d3f9d8; color: #2f9e44; }
  .detail-pct-pill.amber { background: #fff3bf; color: #e67700; }
  .detail-pct-pill.red   { background: #ffe3e3; color: #c92a2a; }

  .detail-stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--c-border);
    border-bottom: 1px solid var(--c-border);
  }
  .detail-stat {
    background: var(--c-surface);
    padding: 16px 20px;
    text-align: center;
  }
  .detail-stat .ds-val {
    font-size: 24px;
    font-weight: 800;
    font-family: var(--c-mono);
    color: var(--c-text);
    line-height: 1;
    margin-bottom: 4px;
  }
  .detail-stat .ds-key { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--c-muted); }
  .detail-stat .ds-val.green { color: var(--c-green); }
  .detail-stat .ds-val.red   { color: var(--c-red);   }

  /* timeline records */
  .records-list { padding: 12px 20px 20px; }
  .record-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 10px;
    margin-bottom: 6px;
    border-left: 3px solid transparent;
    transition: background .15s;
  }
  .record-item.present { border-left-color: var(--c-green); background: rgba(9,146,104,.04); }
  .record-item.absent  { border-left-color: var(--c-red);   background: rgba(201,42,42,.04);  }
  .record-item:hover   { background: #f4f6fb; }
  .rec-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .rec-dot.present { background: var(--c-green); }
  .rec-dot.absent  { background: var(--c-red);   }
  .rec-date {
    min-width: 60px;
    font-size: 12px;
    font-weight: 600;
    color: var(--c-muted);
    font-family: var(--c-mono);
  }
  .rec-time {
    font-size: 11px;
    color: var(--c-muted);
    font-family: var(--c-mono);
  }
  .rec-badge {
    margin-left: auto;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  .rec-badge.present { background: #d3f9d8; color: #2f9e44; }
  .rec-badge.absent  { background: #ffe3e3; color: #c92a2a; }

  /* ── heatmap ── */
  .heatmap-wrap {
    padding: 20px 24px 24px;
  }
  .heatmap-grid {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }
  .hm-cell {
    width: 22px; height: 22px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform .1s, ring .1s;
    position: relative;
  }
  .hm-cell:hover { transform: scale(1.25); z-index: 1; }
  .hm-cell.present  { background: #20c997; }
  .hm-cell.absent   { background: #ff6b6b; }
  .hm-cell.no-class { background: #e9ecf5; }
  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 14px;
    font-size: 12px;
    color: var(--c-muted);
    font-weight: 500;
  }
  .leg-item { display: flex; align-items: center; gap: 6px; }
  .leg-dot { width: 12px; height: 12px; border-radius: 3px; }

  /* ── loading & error states ── */
  .sd-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 14px;
    padding: 60px;
    color: var(--c-muted);
    font-size: 14px;
    font-weight: 500;
  }
  .ld-spinner {
    width: 36px; height: 36px;
    border: 3px solid #e4e9f2;
    border-top-color: var(--c-accent);
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  .sd-error {
    padding: 40px;
    text-align: center;
    color: var(--c-red);
    font-size: 14px;
    font-weight: 500;
  }
  .sd-empty {
    padding: 40px;
    text-align: center;
    color: var(--c-muted);
    font-size: 14px;
  }

  /* ── fade-in animation ── */
  .fade-in {
    animation: fadeIn .3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

/* ─── helpers ───────────────────────────────────────────────────────────────── */
const colorClass = (pct) => pct >= 75 ? 'green' : pct >= 65 ? 'amber' : 'red';
const statusLabel = (pct) => pct >= 75 ? 'Good' : pct >= 65 ? 'At Risk' : 'Critical';

function Ring({ pct, size = 200, stroke = 10 }) {
  const r  = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const col = pct >= 75 ? '#099268' : pct >= 65 ? '#e67700' : '#c92a2a';

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e9ecf5" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={col} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="ring-center">
        <span className={`ring-pct`} style={{ color: col }}>{pct}%</span>
        <span className="ring-label">Attendance</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
const StudentDashboard = () => {
  const { toast } = useToast();

  // ── state ──
  const [overview,     setOverview]     = useState(null);   // { present, absent, percentage, student_name }
  const [subjects,     setSubjects]     = useState([]);      // [{ name, faculty, present, absent, percentage, records[] }]
  const [heatmap,      setHeatmap]      = useState([]);      // [{ date, status }]
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);

  // view: 'overview' | 'subjects' | 'detail'
  const [view,            setView]         = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState(null);

  /* ── fetch all data ── */
  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const [overviewRes, subjectsRes, heatmapRes] = await Promise.all([
        fetch('/api/attendance/overview/', { credentials: 'include' }),
        fetch('/api/attendance/subjects/', { credentials: 'include' }),
        fetch('/api/attendance/heatmap/',  { credentials: 'include' }),
      ]);

      if (!overviewRes.ok) throw new Error('Failed to fetch attendance overview');
      if (!subjectsRes.ok) throw new Error('Failed to fetch subject data');

      const overviewData = await overviewRes.json();
      const subjectsData = await subjectsRes.json();
      const heatmapData  = heatmapRes.ok ? await heatmapRes.json() : [];

      setOverview(overviewData);
      setSubjects(subjectsData.subjects || subjectsData);
      setHeatmap(heatmapData.days || heatmapData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ── fetch subject detail records ── */
  const fetchSubjectDetail = useCallback(async (subjectId) => {
    try {
      const res = await fetch(`/api/attendance/subjects/${subjectId}/records/`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch subject records');
      const data = await res.json();
      setSelectedSubject(prev => ({ ...prev, records: data.records || data }));
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── inject styles ── */
  useEffect(() => {
    const id = 'sd-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id; tag.textContent = CSS;
      document.head.appendChild(tag);
    }
    return () => document.getElementById(id)?.remove();
  }, []);

  /* ── open subject detail ── */
  const openSubject = (subject) => {
    setSelectedSubject(subject);
    setView('detail');
    if (subject.id) fetchSubjectDetail(subject.id);
  };

  /* ── download certificate ── */
  const handleDownload = async () => {
    try {
      const res = await fetch('/api/attendance/certificate/', { credentials: 'include' });
      if (!res.ok) throw new Error('Could not generate certificate');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'attendance_certificate.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      <div className="sd-root">
        <div className="sd-card">
          <div className="sd-loading">
            <div className="ld-spinner" />
            <span>Loading your attendance data…</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  /* ── Error ── */
  if (error && !overview) return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      <div className="sd-root">
        <div className="sd-card">
          <div className="sd-error">
            <HiExclamation style={{ width: 32, height: 32, margin: '0 auto 8px' }} />
            <p>{error}</p>
            <button className="btn-refresh" style={{ margin: '16px auto 0' }} onClick={() => fetchAll()}>
              <HiRefresh style={{ width: 14, height: 14 }} /> Retry
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  const pct    = overview?.percentage ?? 0;
  const col    = colorClass(pct);
  const label  = statusLabel(pct);

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      <div className="sd-root">

        {/* ── Page Header ── */}
        <div className="sd-page-header">
          <div>
            <h1 className="sd-page-title">My Attendance</h1>
            <p className="sd-page-sub">
              {overview?.student_name ? `Welcome back, ${overview.student_name}` : 'Track your attendance and progress'}
            </p>
          </div>
          <button
            className={`btn-refresh${refreshing ? ' spinning' : ''}`}
            onClick={() => fetchAll(true)}
            disabled={refreshing}
          >
            <HiRefresh style={{ width: 15, height: 15 }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ── Overview Card ── */}
        <div className="sd-card" style={{ marginBottom: 20 }}>
          <div className="sd-overview">
            <Ring pct={pct} />

            <div className="status-panel">
              <div className={`status-badge ${col}`}>
                {col === 'green'
                  ? <HiCheckCircle style={{ width: 13, height: 13 }} />
                  : <HiExclamation style={{ width: 13, height: 13 }} />}
                {label}
              </div>

              <div className="stat-row">
                <span className="sk">Total Classes</span>
                <span className="sv">{(overview?.present ?? 0) + (overview?.absent ?? 0)}</span>
              </div>
              <div className="stat-row">
                <span className="sk">Present</span>
                <span className="sv green">{overview?.present ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="sk">Absent</span>
                <span className="sv red">{overview?.absent ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="sk">Required Minimum</span>
                <span className="sv amber">75%</span>
              </div>
              {pct < 75 && (
                <div className="stat-row">
                  <span className="sk">Classes needed for 75%</span>
                  <span className="sv red">
                    {Math.max(0, Math.ceil((0.75 * ((overview?.present ?? 0) + (overview?.absent ?? 0)) - (overview?.present ?? 0)) / 0.25))}
                  </span>
                </div>
              )}

              {pct >= 75 && (
                <button className="btn-cert" onClick={handleDownload}>
                  <HiDownload style={{ width: 17, height: 17 }} />
                  Download Attendance Certificate
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── View Toggle ── */}
        {view !== 'detail' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="view-toggle">
              <button className={`view-tab${view === 'overview' ? ' active' : ''}`} onClick={() => setView('overview')}>
                <HiCalendar style={{ width: 15, height: 15 }} /> Heatmap
              </button>
              <button className={`view-tab${view === 'subjects' ? ' active' : ''}`} onClick={() => setView('subjects')}>
                <HiBookOpen style={{ width: 15, height: 15 }} /> Subject-wise
              </button>
            </div>
          </div>
        )}

        {/* ── Heatmap View ── */}
        {view === 'overview' && (
          <div className="sd-card fade-in">
            <div className="sd-card-header">
              <span className="sd-card-title">Attendance Heatmap</span>
              <span style={{ fontSize: 12, color: 'var(--c-muted)', fontWeight: 500 }}>Last 3 months</span>
            </div>
            <div className="heatmap-wrap">
              {heatmap.length === 0 ? (
                <div className="sd-empty">No heatmap data available.</div>
              ) : (
                <>
                  <div className="heatmap-grid">
                    {heatmap.map((day, i) => (
                      <div
                        key={i}
                        className={`hm-cell ${day.status}`}
                        title={`${day.date}: ${day.status.replace('-', ' ')}`}
                      />
                    ))}
                  </div>
                  <div className="heatmap-legend">
                    <div className="leg-item"><div className="leg-dot" style={{ background: '#20c997' }} /> Present</div>
                    <div className="leg-item"><div className="leg-dot" style={{ background: '#ff6b6b' }} /> Absent</div>
                    <div className="leg-item"><div className="leg-dot" style={{ background: '#e9ecf5' }} /> No Class</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Subject-wise View ── */}
        {view === 'subjects' && (
          <div className="sd-card fade-in">
            <div className="sd-card-header" style={{ paddingBottom: 4 }}>
              <span className="sd-card-title">Subject-wise Attendance</span>
              <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>{subjects.length} subjects</span>
            </div>
            {subjects.length === 0 ? (
              <div className="sd-empty">No subject data found.</div>
            ) : (
              <div className="subjects-grid">
                {subjects.map((sub, i) => {
                  const sc = colorClass(sub.percentage);
                  return (
                    <div
                      key={i}
                      className={`subject-card ${sc} fade-in`}
                      style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => openSubject(sub)}
                    >
                      <HiChevronRight className="sc-arrow" style={{ width: 18, height: 18 }} />
                      <div className="sc-name">{sub.name}</div>
                      {sub.faculty && <div className="sc-faculty">{sub.faculty}</div>}
                      <div className={`sc-pct ${sc}`}>{sub.percentage}%</div>
                      <div className="sc-bar-track">
                        <div className={`sc-bar-fill ${sc}`} style={{ width: `${sub.percentage}%` }} />
                      </div>
                      <div className="sc-meta">
                        <span>{sub.present} present</span>
                        <span>{sub.absent} absent</span>
                      </div>
                      <div className={`sc-status-chip ${sc}`}>{statusLabel(sub.percentage)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Subject Detail View ── */}
        {view === 'detail' && selectedSubject && (
          <div className="sd-card fade-in">
            {/* header */}
            <div className="detail-header">
              <button className="btn-back" onClick={() => { setView('subjects'); setSelectedSubject(null); }}>
                <HiArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <div>
                <div className="detail-title">{selectedSubject.name}</div>
                {selectedSubject.faculty && <div className="detail-sub">{selectedSubject.faculty}</div>}
              </div>
              <div className={`detail-pct-pill ${colorClass(selectedSubject.percentage)}`}>
                {selectedSubject.percentage}%
              </div>
            </div>

            {/* summary stats */}
            <div className="detail-stats-row">
              <div className="detail-stat">
                <div className="ds-val">{(selectedSubject.present ?? 0) + (selectedSubject.absent ?? 0)}</div>
                <div className="ds-key">Total</div>
              </div>
              <div className="detail-stat">
                <div className="ds-val green">{selectedSubject.present ?? 0}</div>
                <div className="ds-key">Present</div>
              </div>
              <div className="detail-stat">
                <div className="ds-val red">{selectedSubject.absent ?? 0}</div>
                <div className="ds-key">Absent</div>
              </div>
            </div>

            {/* records list */}
            <div className="records-list">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <HiClipboardList style={{ width: 16, height: 16, color: 'var(--c-muted)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-muted)' }}>
                  Attendance Records
                </span>
              </div>

              {!selectedSubject.records ? (
                <div className="sd-loading" style={{ padding: '30px 0' }}>
                  <div className="ld-spinner" />
                  <span>Loading records…</span>
                </div>
              ) : selectedSubject.records.length === 0 ? (
                <div className="sd-empty" style={{ padding: '24px 0' }}>No records found for this subject.</div>
              ) : (
                selectedSubject.records.map((rec, i) => {
                  const isPresent = rec.status?.toLowerCase() === 'present';
                  return (
                    <div key={i} className={`record-item ${isPresent ? 'present' : 'absent'}`}>
                      <div className={`rec-dot ${isPresent ? 'present' : 'absent'}`} />
                      <div className="rec-date">
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      {rec.time && <span className="rec-time">{rec.time}</span>}
                      <span className={`rec-badge ${isPresent ? 'present' : 'absent'}`}>
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;