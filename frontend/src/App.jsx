import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome_Premium';
import AddStudent from './pages/AddStudent';
import AddFaculty from './pages/AddFaculty';
import ViewStudents from './pages/ViewStudents';
import ViewFaculty from './pages/ViewFaculty';
import ViewAttendance from './pages/ViewAttendance';
import FacultyDashboard from './pages/FacultyDashboard_Premium';
import StudentDashboard from './pages/StudentDashboard_Premium';
import './index.css';

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
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminHome /></ProtectedRoute>} />
      <Route path="/admin/add-student" element={<ProtectedRoute roles={['admin']}><AddStudent /></ProtectedRoute>} />
      <Route path="/admin/add-faculty" element={<ProtectedRoute roles={['admin']}><AddFaculty /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><ViewStudents /></ProtectedRoute>} />
      <Route path="/admin/faculty" element={<ProtectedRoute roles={['admin']}><ViewFaculty /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><ViewAttendance /></ProtectedRoute>} />

      {/* Faculty */}
      <Route path="/faculty/dashboard" element={<ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  console.log('App rendering...');
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider position="top-right">
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
              <Header />
              <main style={{ maxWidth: '6xl', margin: '0 auto', padding: '1.5rem' }}>
                <AppRoutes />
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
