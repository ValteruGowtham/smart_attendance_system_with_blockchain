import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import './index.css';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const AdminHome = lazy(() => import('./pages/AdminDashboard'));
const AddStudent = lazy(() => import('./pages/AddStudent'));
const AddFaculty = lazy(() => import('./pages/AddFaculty'));
const ViewStudents = lazy(() => import('./pages/ViewStudents'));
const ViewFaculty = lazy(() => import('./pages/ViewFaculty'));
const ViewAttendance = lazy(() => import('./pages/ViewAttendance'));
const FacultyDashboard = lazy(() => import('./pages/FacultyDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AttendanceAlerts = lazy(() => import('./pages/AttendanceAlerts'));
const AttendanceCalendar = lazy(() => import('./pages/AttendanceCalendar'));
const ProfileUpdate = lazy(() => import('./pages/ProfileUpdate'));
const SessionReport = lazy(() => import('./pages/SessionReport'));
const NotificationsCenter = lazy(() => import('./pages/NotificationsCenter'));
const BlockchainPage = lazy(() => import('./pages/BlockchainPage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role if specified
  if (roles && !roles.includes(user.role)) {
    console.warn(`Access denied: User role '${user.role}' not in allowed roles:`, roles);
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
  }
  
  // User not logged in, show public page
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/blockchain" element={<BlockchainPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/add-student" element={<ProtectedRoute roles={['admin']}><AddStudent /></ProtectedRoute>} />
        <Route path="/admin/add-faculty" element={<ProtectedRoute roles={['admin']}><AddFaculty /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><ViewStudents /></ProtectedRoute>} />
        <Route path="/admin/faculty" element={<ProtectedRoute roles={['admin']}><ViewFaculty /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><ViewAttendance /></ProtectedRoute>} />

        {/* Faculty */}
        <Route path="/faculty/dashboard" element={<ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/session-report" element={<ProtectedRoute roles={['faculty']}><SessionReport /></ProtectedRoute>} />
        <Route path="/faculty/attendance-alerts" element={<ProtectedRoute roles={['faculty']}><AttendanceAlerts /></ProtectedRoute>} />
        <Route path="/faculty/profile" element={<ProtectedRoute roles={['faculty']}><ProfileUpdate /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attendance-calendar" element={<ProtectedRoute roles={['student']}><AttendanceCalendar /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><ProfileUpdate /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute roles={['student']}><NotificationsCenter /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const location = useLocation();
  const isFullPage = ['/', '/login', '/blockchain'].includes(location.pathname);

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: isFullPage ? 'transparent' : '#f4f6fb' }}
    >
      <ScrollToTop />
      <Header />
      <div className={isFullPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        <AppRoutes />
      </div>
    </div>
  );
}

export default function App() {
  console.log('App rendering...');
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider position="top-right">
            <AppShell />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
