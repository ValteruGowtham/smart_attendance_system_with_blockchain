import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
    background: #0d1117;
  }

  /* animated background blobs */
  .blob {
    position: absolute;
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(124,58,237,0.1) 100%);
    filter: blur(80px);
    border-radius: 50%;
    z-index: 0;
    animation: float 20s infinite alternate;
  }
  .blob-1 { top: -100px; right: -100px; }
  .blob-2 { bottom: -150px; left: -150px; background: linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(99,102,241,0.1) 100%); }

  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(40px, 60px) scale(1.1); }
  }

  .login-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    padding: 0 24px;
  }

  .login-card {
    background: rgba(22, 27, 34, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .brand-logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.3);
  }
  .brand-logo svg { font-size: 30px; color: white; }
  .brand-title { font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.03em; }
  .brand-sub { color: #8b949e; font-size: 15px; margin-top: 6px; }

  .field-group { margin-bottom: 20px; }
  .field-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #8b949e;
    margin-bottom: 8px;
    margin-left: 4px;
  }
  .input-wrap { position: relative; }
  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #484f58;
    font-size: 18px;
  }
  .input-field {
    width: 100%;
    background: #0d1117;
    border: 1.5px solid #30363d;
    border-radius: 14px;
    padding: 14px 16px 14px 48px;
    color: white;
    font-size: 15px;
    transition: all 0.2s;
  }
  .input-field:focus {
    border-color: #58a6ff;
    background: #161b22;
    box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.1);
    outline: none;
  }

  .forgot-link {
    display: block;
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    color: #58a6ff;
    text-decoration: none;
    margin-top: 8px;
  }
  .forgot-link:hover { text-decoration: underline; }

  .btn-submit {
    width: 100%;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s;
    margin-top: 32px;
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
  }
  .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(79, 70, 229, 0.35); }
  .btn-submit:active { transform: translateY(0); }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .divider {
    display: flex;
    align-items: center;
    margin: 24px 0;
    color: #484f58;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #30363d;
  }
  .divider span { padding: 0 16px; }

  .btn-google {
    width: 100%;
    background: white;
    color: #1f2937;
    border: 1px solid #d1d5db;
    border-radius: 14px;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.2s;
  }
  .btn-google:hover { background: #f9fafb; border-color: #9ca3af; }

  .footer-text {
    text-align: center;
    margin-top: 32px;
    font-size: 14px;
    color: #8b949e;
  }
  .footer-text a { color: #58a6ff; text-decoration: none; font-weight: 600; }
  .footer-text a:hover { text-decoration: underline; }

  .trust-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    font-size: 12px;
    color: #484f58;
  }
  .trust-badge svg { color: #238636; }

  .error-msg {
    background: rgba(248, 81, 73, 0.1);
    border: 1px solid rgba(248, 81, 73, 0.2);
    color: #ff7b72;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Verify ID, 2: New Password
  const [verifyId, setVerifyId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const id = 'login-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
    return () => document.getElementById(id)?.remove();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      const userRole = data.role?.toLowerCase();
      if (userRole === 'admin') window.location.href = '/admin';
      else if (userRole === 'faculty') window.location.href = '/faculty/dashboard';
      else if (userRole === 'student') window.location.href = '/student/dashboard';
      else window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyId = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Simulate verification of Registration ID
      await new Promise(r => setTimeout(r, 1000));
      if (verifyId.length < 3) throw new Error('Invalid Registration / UID');
      setResetStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Simulate password update
      await new Promise(r => setTimeout(r, 1500));
      setSuccessMsg('Password updated successfully!');
      setTimeout(() => {
        setShowForgot(false);
        setResetStep(1);
        setSuccessMsg('');
        setVerifyId('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="login-container">
        <div className="login-header">
          <div className="brand-logo">
            <HiOutlineAcademicCap />
          </div>
          <h1 className="brand-title">
            {!showForgot ? 'Welcome Back' : resetStep === 1 ? 'Verify Identity' : 'Set New Password'}
          </h1>
          <p className="brand-sub">
            {!showForgot 
              ? 'Secure access to Smart Attendance System' 
              : resetStep === 1 
                ? 'Enter your Registration ID / UID to continue' 
                : 'Create a strong password for your account'}
          </p>
        </div>

        <div className="login-card">
          {error && (
            <div className="error-msg">
              <HiOutlineShieldCheck />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="error-msg" style={{ background: 'rgba(35, 134, 54, 0.1)', borderColor: 'rgba(35, 134, 54, 0.2)', color: '#3fb950' }}>
              <HiOutlineShieldCheck />
              {successMsg}
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Username or ID</label>
                <div className="input-wrap">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your ID or username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group" style={{ marginBottom: 8 }}>
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => { setShowForgot(true); setResetStep(1); setError(''); }} 
                className="forgot-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <HiOutlineArrowRight />}
              </button>
            </form>
          ) : resetStep === 1 ? (
            <form onSubmit={handleVerifyId}>
              <div className="field-group">
                <label className="field-label">Registration / UID</label>
                <div className="input-wrap">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. CSE2021001"
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Identity'}
                {!loading && <HiOutlineShieldCheck />}
              </button>

              <button 
                type="button" 
                onClick={() => setShowForgot(false)} 
                className="footer-text"
                style={{ display: 'block', width: '100%', marginTop: 24, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Back to <span style={{ color: '#58a6ff', fontWeight: 600 }}>Sign In</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <div className="field-group">
                <label className="field-label">New Password</label>
                <div className="input-wrap">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className="input-wrap">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
                {!loading && <HiOutlineArrowRight />}
              </button>

              <button 
                type="button" 
                onClick={() => setResetStep(1)} 
                className="footer-text"
                style={{ display: 'block', width: '100%', marginTop: 24, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Go <span style={{ color: '#58a6ff', fontWeight: 600 }}>Back</span>
              </button>
            </form>
          )}
        </div>

        {!showForgot && (
          <p className="footer-text">
            New here? <a href="mailto:admin@system.com">Contact Administrator</a>
          </p>
        )}

        <div className="trust-badge">
          <HiOutlineShieldCheck size={16} />
          <span>AES-256 Encrypted · Blockchain Verified Records</span>
        </div>
      </div>
    </div>
  );
}
