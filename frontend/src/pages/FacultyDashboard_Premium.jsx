import { useState, useEffect, useRef } from 'react';
import { getFacultyDashboard, markAttendance, openAttendanceWindow, closeAttendanceWindow } from '../api/api';
import {
  HiOutlineCheckCircle,
  HiOutlineVideoCamera,
  HiOutlineCamera,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineXCircle,
} from 'react-icons/hi';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  StatCard,
  HighlightCard,
  Select,
  Checkbox,
} from '../components/ui';
import { SkeletonCard, SkeletonText } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

export default function FacultyDashboardPremium() {
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
  const [lastMarked, setLastMarked] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openingWindow, setOpeningWindow] = useState(false);
  const [closingWindow, setClosingWindow] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const autoCloseTriggeredRef = useRef(false);

  // Load initial data
  useEffect(() => {
    getFacultyDashboard()
      .then((r) => {
        setMeta(r.data);
        setForm({
          branch: r.data.branches[0] || '',
          year: r.data.years[0] || '',
          section: r.data.sections[0] || '',
        });
      })
      .catch(() => {
        toast.error('Failed to load faculty dashboard');
      });
    return () => stopCamera();
  }, []);

  // Timer for attendance window cutoff
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

        // Immediately stop camera before closing window
        stopCamera();

        try {
          const res = await closeAttendanceWindow(buildAttendanceFormData());
          setWindowOpen(false);
          setActivePeriod('');
          setWindowCutoff('');
          setWindowCutoffIso('');
          setTodayRecords(res.data.records || []);
          setSummary(res.data.summary || null);
          toast.warning('Attendance window closed at cutoff time', {
            title: 'Window Closed',
          });
        } catch (err) {
          setWindowOpen(false);
          toast.error('Error closing attendance window');
        }
        return;
      }

      setTimeLeft(formatTimeLeft(diff));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [windowOpen, windowCutoffIso]);

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
      toast.error(`Camera access denied: ${err.message}`, { title: 'Camera Error' });
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
      toast.success(`Attendance window opened for Period ${res.data.period}`, {
        title: 'Window Open',
      });
      setTimeout(() => {
        startCamera();
      }, 300);
    } catch (err) {
      setWindowOpen(false);
      stopCamera();
      setSummary(err.response?.data?.summary || null);
      toast.error(err.response?.data?.error || 'Could not open attendance window', {
        title: 'Error',
      });
    } finally {
      setOpeningWindow(false);
    }
  };

  const captureAndSubmit = async () => {
    if (!windowOpen) {
      toast.warning('Please open attendance window first', { title: 'Window Closed' });
      return;
    }
    if (!cameraOn) {
      toast.warning('Camera is not active', { title: 'Camera Off' });
      return;
    }

    // Additional safety check - prevent submission if somehow window state is inconsistent
    if (!activePeriod) {
      toast.error('Period information missing', { title: 'Error' });
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
      toast.success(`Marked Present: ${res.data.marked_student_id}`, {
        title: 'Attendance Marked',
      });
    } catch (err) {
      const unidentified = err.response?.data?.unidentified;
      const cutoffReached = (err.response?.data?.error || '').toLowerCase().includes('window closed');

      if (cutoffReached) {
        // Force window close and disable camera immediately if cutoff reached
        setWindowOpen(false);
        setActivePeriod('');
        setWindowCutoff('');
        setWindowCutoffIso('');
        stopCamera();
      }

      toast.error(
        unidentified ? 'Unidentified face. Attendance not marked.' : err.response?.data?.error || 'Error marking attendance',
        { title: 'Error' }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeWindow = async () => {
    setClosingWindow(true);
    // Immediately stop camera to prevent state inconsistency
    stopCamera();
    
    try {
      const res = await closeAttendanceWindow(buildAttendanceFormData());
      setWindowOpen(false);
      setActivePeriod('');
      setWindowCutoff('');
      setWindowCutoffIso('');
      setTodayRecords(res.data.records || []);
      setSummary(res.data.summary || null);
      toast.success(`Window closed. ${res.data.absent_marked_now || 0} students marked absent`, {
        title: 'Success',
      });
    } catch (err) {
      // Ensure window state is closed even if API fails
      setWindowOpen(false);
      setActivePeriod('');
      setWindowCutoff('');
      setWindowCutoffIso('');
      toast.error(err.response?.data?.error || 'Error closing window', { title: 'Error' });
    } finally {
      setClosingWindow(false);
    }
  };

  if (!meta) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonCard lines={2} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} elevation="md">
              <SkeletonText lines={2} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const selectedPeriodTime = meta?.period_slots?.[activePeriod] || '';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {meta.faculty_name}! 👨‍🏫</h1>
            <p className="text-emerald-100">Mark attendance with AI-powered face recognition</p>
          </div>
          <HiOutlineAcademicCap className="w-24 h-24 text-white opacity-20 hidden md:block" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Today's Records"
          value={todayRecords.length}
          icon={HiOutlineCheckCircle}
          description="Attendance marked"
        />
        {summary && (
          <>
            <StatCard
              title="Present"
              value={summary.present}
              icon={HiOutlineCheck}
              trendPositive={true}
              description="Students marked"
            />
            <StatCard
              title="Absent"
              value={summary.absent}
              icon={HiOutlineX}
              trendPositive={false}
              description="Auto-marked"
            />
          </>
        )}
      </div>

      {/* Alert if Window Open */}
      {windowOpen && (
        <HighlightCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-blue-900">Attendance Window Active</h3>
                <p className="text-sm text-blue-800">Period {activePeriod} • {selectedPeriodTime}</p>
              </div>
            </div>
            {timeLeft && (
              <div className="text-right">
                <p className="text-xs text-blue-600">Time remaining</p>
                <p className="text-lg font-bold text-blue-900 font-mono">{timeLeft}</p>
              </div>
            )}
          </div>
        </HighlightCard>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-2">
          <Card elevation="lg" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiOutlineCheckCircle className="w-5 h-5" />
                Mark Attendance
              </CardTitle>
              <CardDescription>Select class and mark attendance with face recognition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'branch', label: 'Branch', options: meta.branches },
                  { name: 'year', label: 'Year', options: meta.years },
                  { name: 'section', label: 'Section', options: meta.sections },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {f.label}
                    </label>
                    <select
                      value={form[f.name]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                      disabled={windowOpen}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800"
                    >
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Camera Feed - Only show when window is OPEN */}
              {windowOpen && cameraOn ? (
                <div className="rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    className="hidden"
                  />
                </div>
              ) : windowOpen ? (
                <div className="rounded-lg bg-slate-900 p-8 flex items-center justify-center min-h-64">
                  <div className="text-center">
                    <HiOutlineVideoCamera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium">Camera initializing...</p>
                    <p className="text-sm text-slate-500 mt-1">Please allow camera access</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center min-h-64 border border-slate-700">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <HiOutlineXCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Attendance Window Closed</h3>
                    <p className="text-sm text-slate-400 mt-2">Camera is inactive. Open the attendance window to begin marking.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap items-center">
                {/* Window Status Badge */}
                <div className={`px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                  windowOpen
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${windowOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {windowOpen ? 'Window Active' : 'Window Closed'}
                </div>

                <div className="flex-1" />

                <Button
                  variant={windowOpen ? 'danger' : 'primary'}
                  icon={windowOpen ? HiOutlineXCircle : HiOutlineVideoCamera}
                  loading={windowOpen ? closingWindow : openingWindow}
                  disabled={!windowOpen && (!form.branch || !form.year || !form.section)}
                  onClick={windowOpen ? closeWindow : openWindow}
                  size="md"
                >
                  {windowOpen ? 'Close Window' : 'Open Window'}
                </Button>

                <Button
                  variant="success"
                  icon={HiOutlineCamera}
                  loading={submitting}
                  disabled={!windowOpen || !cameraOn}
                  onClick={captureAndSubmit}
                  size="md"
                >
                  Capture & Mark
                </Button>
              </div>

              {/* Last Marked Info */}
              {lastMarked && (
                <Card elevation="sm" className="bg-green-50 dark:bg-green-900/20 border border-green-200">
                  <CardContent className="py-3">
                    <p className="text-sm text-green-900 dark:text-green-200">
                      <span className="font-semibold">Last Marked:</span> {lastMarked}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Records */}
        <div>
          <Card elevation="lg" padding="lg" className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiOutlineUserGroup className="w-5 h-5" />
                Today's Records
              </CardTitle>
              <CardDescription>{todayRecords.length} entries</CardDescription>
            </CardHeader>
            <CardContent>
              {todayRecords.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todayRecords.map((record, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {record.student_id}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {record.student_name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            record.status === 'Present'
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {record.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {record.time || 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No records yet</p>
                  <p className="text-xs text-gray-400 mt-1">Open attendance window to start marking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
