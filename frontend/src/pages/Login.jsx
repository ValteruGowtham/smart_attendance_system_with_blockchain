import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineAcademicCap, HiOutlineLightningBolt } from 'react-icons/hi';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'faculty') navigate('/faculty/dashboard');
      else if (data.role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      const serverError = err?.response?.data?.error;
      setError(serverError || err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <HiOutlineLightningBolt className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineLockClosed className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Secure Login</h2>
              <p className="text-indigo-100 text-sm mt-2">Access your dashboard</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-12 w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <HiOutlineLockClosed className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Quick Access */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Quick Access</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { role: 'Student', color: 'blue', icon: '🎓', tip: 'Use Registration ID' },
                  { role: 'Faculty', color: 'green', icon: '👨‍🏫', tip: 'Use Faculty UID' },
                  { role: 'Admin', color: 'purple', icon: '👑', tip: 'Use admin' },
                ].map((t) => (
                  <div
                    key={t.role}
                    className={`group p-4 bg-${t.color}-50 rounded-xl hover:bg-${t.color}-100 transition-all cursor-pointer text-center border-2 border-transparent hover:border-${t.color}-200`}
                    onClick={() => {
                      if (t.role === 'Admin') {
                        setUsername('admin');
                        setPassword('admin123');
                      }
                    }}
                  >
                    <div className="text-3xl mb-2">{t.icon}</div>
                    <p className={`text-${t.color}-600 font-bold text-sm`}>{t.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 text-center border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">AI-Powered Attendance System</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Secured with FaceNet™ Technology</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
