import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import AddStudent from './pages/AddStudent';
import AddFaculty from './pages/AddFaculty';
import ViewStudents from './pages/ViewStudents';
import ViewFaculty from './pages/ViewFaculty';
import ViewAttendance from './pages/ViewAttendance';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './index.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - loading:', loading, 'user:', user, 'roles:', roles);
  
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
    console.log('No user, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    console.log('User role not allowed:', user.role);
    return <Navigate to="/" />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  console.log('PublicRoute - loading:', loading, 'user:', user);
  
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
  
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" />;
  }
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <main style={{ maxWidth: '6xl', margin: '0 auto', padding: '1.5rem' }}>
            <AppRoutes />
          </main>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
