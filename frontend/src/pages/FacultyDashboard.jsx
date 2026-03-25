import { useState, useEffect, useRef } from 'react';
import { getFacultyDashboard, markAttendance, openAttendanceWindow, closeAttendanceWindow } from '../api/api';
import Toast from '../components/Toast';
import {
  HiOutlineCheckCircle,
  HiOutlineVideoCamera,
  HiOutlineCamera,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

export default function FacultyDashboard() {
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({ branch: '', year: '', section: '' });
  const [activePeriod, setActivePeriod] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [windowCutoff, setWindowCutoff] = useState('');
  const [windowCutoffIso, setWindowCutoffIso] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [todayRecords, setTodayRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastMarked, setLastMarked] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openingWindow, setOpeningWindow] = useState(false);
  const [closingWindow, setClosingWindow] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const autoCloseTriggeredRef = useRef(false);

  useEffect(() => {
    getFacultyDashboard().then((r) => {
      setMeta(r.data);
      setForm({
        branch: r.data.branches[0] || '',
        year: r.data.years[0] || '',
        section: r.data.sections[0] || '',
      });
    }).catch(() => {});
    return () => stopCamera();
  }, []);

  const selectedPeriodTime = meta?.period_slots?.[activePeriod] || '';

  useEffect(() => {
    if (!windowOpen || !windowCutoffIso) {
      setTimeLeft('');
      return;
    }

    const cutoffMs = new Date(windowCutoffIso).getTime();

    const formatTimeLeft = (ms) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      return `${minutes}:${seconds}`;
    };

    const tick = async () => {
      const diff = cutoffMs - Date.now();

      if (diff <= 0) {
        setTimeLeft('00:00');
        if (autoCloseTriggeredRef.current) return;
        autoCloseTriggeredRef.current = true;

        try {
          const res = await closeAttendanceWindow(buildAttendanceFormData());
          setWindowOpen(false);
          setActivePeriod('');
          setWindowCutoff('');
          setWindowCutoffIso('');
          stopCamera();
          setTodayRecords(res.data.records || []);
          setSummary(res.data.summary || null);
          setToast({ msg: 'Attendance window closed automatically at cutoff.', type: 'warning' });
        } catch (err) {
          setWindowOpen(false);
          setActivePeriod('');
          setWindowCutoff('');
          setWindowCutoffIso('');
          stopCamera();
          setToast({ msg: err.response?.data?.error || 'Attendance window closed at cutoff.', type: 'warning' });
        }
        return;
      }

      setTimeLeft(formatTimeLeft(diff));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [windowOpen, windowCutoffIso, form.branch, form.year, form.section, activePeriod]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      setToast({ msg: 'Camera access denied: ' + err.message, type: 'error' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const buildAttendanceFormData = (faceImage = '') => {
    const fd = new FormData();
    fd.append('branch', form.branch);
    fd.append('year', form.year);
    fd.append('section', form.section);
    if (activePeriod) fd.append('period', activePeriod);
    if (faceImage) fd.append('face_image_data', faceImage);
    return fd;
  };

  const openWindow = async () => {
    setOpeningWindow(true);
    try {
      const res = await openAttendanceWindow(buildAttendanceFormData());
      autoCloseTriggeredRef.current = false;
      setWindowOpen(true);
      setActivePeriod(res.data.period || '');
      setWindowCutoff(res.data.window_cutoff || '');
      setWindowCutoffIso(res.data.window_cutoff_iso || '');
      setToast({ msg: `Attendance window opened for Period ${res.data.period}. Cutoff: ${res.data.window_cutoff || 'N/A'}`, type: 'success' });
      setTimeout(() => {
        startCamera();
      }, 300);
    } catch (err) {
      setWindowOpen(false);
      setActivePeriod('');
      setWindowCutoff('');
      setWindowCutoffIso('');
      stopCamera();
      setSummary(err.response?.data?.summary || null);
      setToast({ msg: err.response?.data?.error || 'Could not open attendance window', type: 'error' });
    } finally {
      setOpeningWindow(false);
    }
  };

  const captureAndSubmit = async () => {
    if (!windowOpen) {
      setToast({ msg: 'Open attendance window first.', type: 'warning' });
      return;
    }
    if (!cameraOn) {
      setToast({ msg: 'Camera is not active.', type: 'warning' });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    setSubmitting(true);
    try {
      const res = await markAttendance(buildAttendanceFormData(dataUrl));
      setTodayRecords(res.data.records);
      setSummary(res.data.summary);
      setLastMarked(`${res.data.marked_student_name} (${res.data.marked_student_id})`);
      setToast({ msg: `Marked Present: ${res.data.marked_student_id}`, type: 'success' });
    } catch (err) {
      const unidentified = err.response?.data?.unidentified;
      const cutoffReached = (err.response?.data?.error || '').toLowerCase().includes('window closed');

      if (cutoffReached) {
        setWindowOpen(false);
        setActivePeriod('');
        setWindowCutoff('');
        setWindowCutoffIso('');
        stopCamera();
        if (err.response?.data?.summary) setSummary(err.response.data.summary);
      }

      setToast({
        msg: unidentified ? 'Unidentified face. Attendance not marked.' : (err.response?.data?.error || 'Error marking attendance'),
        type: unidentified ? 'warning' : 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeWindow = async () => {
    setClosingWindow(true);
    try {
      const res = await closeAttendanceWindow(buildAttendanceFormData());
      setWindowOpen(false);
      setActivePeriod('');
      setWindowCutoff('');
      setWindowCutoffIso('');
      stopCamera();
      setTodayRecords(res.data.records || []);
      setSummary(res.data.summary || null);
      setToast({ msg: `Window closed. ${res.data.absent_marked_now || 0} students marked absent.`, type: 'success' });
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Error closing attendance window', type: 'error' });
    } finally {
      setClosingWindow(false);
    }
  };

  if (!meta) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-500">Loading dashboard...</p></div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {meta.faculty_name}! 👨‍🏫</h1>
            <p className="text-emerald-100">Mark attendance with AI-powered face recognition</p>
          </div>
          <HiOutlineAcademicCap className="w-20 h-20 text-white opacity-20 hidden md:block" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-semibold">Today's Records</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{todayRecords.length}</h3>
        </div>
        {summary && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-semibold">Present</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">{summary.present}</h3>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 font-semibold">Absent</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{summary.absent}</h3>
            </div>
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
            Mark Attendance
          </h3>
          
          <div className="space-y-6">
            {/* Class Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'branch', label: 'Branch', options: meta.branches },
                { name: 'year', label: 'Year', options: meta.years },
                { name: 'section', label: 'Section', options: meta.sections },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                  <select
                    value={form[f.name]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                    disabled={windowOpen}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Period Info */}
            {windowOpen && selectedPeriodTime && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-sm font-semibold text-emerald-700">Current Period:</span>
                    <span className="ml-2 font-bold text-emerald-900">{activePeriod}</span>
                    <span className="ml-2 text-emerald-600">({selectedPeriodTime})</span>
                  </div>
                  {windowCutoff && (
                    <div>
                      <span className="text-sm font-semibold text-emerald-700">Cutoff:</span>
                      <span className="ml-2 font-bold text-emerald-900">{windowCutoff}</span>
                    </div>
                  )}
                  {timeLeft && (
                    <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                      <HiOutlineClock className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-red-600">{timeLeft}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Camera Area */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300">
              <label className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <HiOutlineVideoCamera className="w-5 h-5 text-emerald-600" />
                AI Face Recognition {windowOpen ? '(Window Open)' : '(Window Closed)'}
              </label>
              
              <div className="flex flex-col items-center">
                <video
                  ref={videoRef}
                  width="320"
                  height="240"
                  className="rounded-xl border-4 border-white shadow-lg bg-black"
                  autoPlay
                  playsInline
                  style={{ display: cameraOn ? 'block' : 'none' }}
                />
                {!cameraOn && windowOpen && (
                  <div className="text-gray-400 text-sm mt-4">Camera starting...</div>
                )}
                {!cameraOn && !windowOpen && (
                  <div className="text-gray-400 text-sm mt-4">Open window to activate camera</div>
                )}
                <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />

                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  {!windowOpen && (
                    <button
                      type="button"
                      onClick={openWindow}
                      disabled={openingWindow}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <HiOutlineVideoCamera className="w-5 h-5" />
                      {openingWindow ? 'Opening...' : 'Open Window'}
                    </button>
                  )}

                  {windowOpen && cameraOn && (
                    <button
                      type="button"
                      onClick={captureAndSubmit}
                      disabled={submitting}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <HiOutlineCamera className="w-5 h-5" />
                      {submitting ? 'Submitting...' : 'Capture & Mark'}
                    </button>
                  )}

                  {windowOpen && (
                    <button
                      type="button"
                      onClick={closeWindow}
                      disabled={closingWindow}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <HiOutlineCheckCircle className="w-5 h-5" />
                      {closingWindow ? 'Closing...' : 'Close & Mark Absent'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Records */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <HiOutlineUserGroup className="w-6 h-6 text-emerald-600" />
            Today's Attendance
          </h3>
          
          {todayRecords.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayRecords.map((record, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border-l-4 ${
                    record.status === 'Present'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{record.student_name}</p>
                      <p className="text-xs text-gray-500">{record.student_id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status === 'Present' ? '✓ Present' : '✗ Absent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HiOutlineUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No records today</p>
              <p className="text-sm text-gray-400 mt-1">Open window to mark attendance</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Attendance Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold">Present</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{summary.present}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold">Absent</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{summary.absent}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold">Total</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{summary.total}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold">Percentage</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{summary.percentage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
