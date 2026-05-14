import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getPublicStats } from '../api/api';
import {
  HiOutlineLogin,
  HiOutlineVideoCamera,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineLockClosed,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineStar,
  HiOutlineChevronDown,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineSparkles,
  HiOutlineMail,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlineFingerPrint,
  HiOutlineChartPie,
  HiOutlineTrendingUp,
  HiOutlineArrowRight,
  HiOutlineBadgeCheck,
  HiOutlineChip,
  HiOutlineBeaker,
  HiOutlineKey,
  HiOutlineDatabase,
  HiOutlineDocumentReport,
  HiOutlineUsers,
} from 'react-icons/hi';

// ─── Motion Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  show: { transition: { staggerChildren: 0.09 } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

// ─── Counter Component ───────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value);
    if (isNaN(num)) { setDisplay(value); return; }
    const start = performance.now();
    const duration = 1400;
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(ease * num));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Landing() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({ students: 0, records: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getPublicStats()
      .then(r => setStats({ students: r.data.total_students || 0, records: r.data.total_attendance || 0 }))
      .catch(() => {});
  }, []);

  const metrics = [
    { value: stats.students, suffix: '+', label: 'Active Students', icon: HiOutlineUsers },
    { value: stats.records, suffix: '+', label: 'Attendance Records', icon: HiOutlineChartBar },
    { value: '99.3', suffix: '%', label: 'Recognition Accuracy', icon: HiOutlineBadgeCheck, raw: true },
    { value: '0.8', suffix: 's', label: 'Avg. Recognition Time', icon: HiOutlineLightningBolt, raw: true },
  ];

  const features = [
    {
      icon: HiOutlineVideoCamera,
      color: 'indigo',
      title: 'AI Face Recognition',
      desc: 'FaceNet-powered biometric engine with 99.3% accuracy, liveness detection, and anti-spoofing — all in under a second.',
      tags: ['Multi-angle', 'Anti-spoofing', 'Real-time'],
    },
    {
      icon: HiOutlineLockClosed,
      color: 'violet',
      title: 'Bank-Grade Security',
      desc: 'AES-256 encrypted embeddings, zero raw image storage, full GDPR compliance, and a tamper-proof blockchain audit trail.',
      tags: ['Zero image storage', 'GDPR compliant', 'Blockchain'],
    },
    {
      icon: HiOutlineChartPie,
      color: 'sky',
      title: 'Smart Analytics',
      desc: 'Live dashboards, automated attendance reports, trend analysis, and low-attendance alerts for faculty and students.',
      tags: ['Live dashboard', 'Auto-reports', 'Alerts'],
    },
  ];

  const roles = [
    {
      icon: '🎓',
      title: 'Students',
      color: 'from-blue-500 to-indigo-600',
      items: ['View real-time attendance', 'Export PDF certificate', 'Low-attendance alerts', 'Track class-wise %'],
    },
    {
      icon: '📖',
      title: 'Faculty',
      color: 'from-violet-500 to-purple-600',
      items: ['One-tap face-scan class', 'Edit & correct records', 'Session-wise reports', 'Bulk attendance export'],
    },
    {
      icon: '🏛️',
      title: 'Administrators',
      color: 'from-rose-500 to-pink-600',
      items: ['Manage all users', 'Cross-department analytics', 'Full audit logs', 'System configuration'],
    },
  ];

  const faqs = [
    { q: 'How accurate is the face recognition?', a: 'Our FaceNet-based system achieves 99.3% accuracy across varied lighting, angles, and demographics. Real-world testing shows very few false positives.' },
    { q: 'Is student biometric data stored securely?', a: 'Faces are converted to 128-dimensional mathematical embeddings — never stored as images. All data is AES-256 encrypted and GDPR compliant.' },
    { q: 'What devices and browsers are supported?', a: 'Any device with a webcam works: laptops, tablets, and phones. Supports Chrome, Firefox, Safari, and Edge (latest versions).' },
    { q: 'Can attendance records be edited manually?', a: 'Yes. Faculty and admins can correct or adjust records. All changes are logged in the immutable blockchain audit trail.' },
    { q: 'Does it work offline or in low bandwidth?', a: 'Recognition requires an internet connection (≥ 5 Mbps). Pre-computed embeddings are cached to minimize bandwidth during class sessions.' },
  ];

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased" style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Sora:wght@700;800&display=swap');

        :root {
          --primary: #4f46e5;
          --primary-dark: #3730a3;
          --primary-light: #eef2ff;
          --accent: #7c3aed;
          --surface: #f8f7ff;
          --border: #e5e7eb;
          --text: #111827;
          --muted: #6b7280;
        }

        html { scroll-behavior: smooth; }

        .gradient-text {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-grid {
          background-image: radial-gradient(circle, #c7d2fe 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(79, 70, 229, 0.12);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 13px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.32);
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.42);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #374151;
          padding: 13px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          border: 1.5px solid #e5e7eb;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .btn-ghost:hover {
          border-color: #a5b4fc;
          color: #4f46e5;
          background: #f5f3ff;
        }

        .faq-answer {
          overflow: hidden;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .float-slow { animation: float-slow 7s ease-in-out infinite; }
        .float-slow-2 { animation: float-slow 9s ease-in-out infinite 1.5s; }

        .glow-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .step-line::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -50%;
          width: 100%;
          height: 1.5px;
          background: linear-gradient(90deg, #c7d2fe, transparent);
        }

        @media (max-width: 768px) {
          .step-line::after { display: none; }
        }

        .live-dot {
          width: 8px; height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: ping 1.5s ease-in-out infinite;
        }
        @keyframes ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        }

        .bar-animate {
          transition: height 1s cubic-bezier(0.16,1,0.3,1);
        }

        .feature-icon-bg-indigo { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); }
        .feature-icon-bg-violet { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
        .feature-icon-bg-sky { background: linear-gradient(135deg, #e0f2fe, #bae6fd); }
        .feature-icon-color-indigo { color: #4f46e5; }
        .feature-icon-color-violet { color: #7c3aed; }
        .feature-icon-color-sky { color: #0284c7; }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <HiOutlineFingerPrint className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>AttendanceAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">{l.label}</a>
            ))}
            <Link to="/login" className="btn-primary" style={{ padding: '9px 22px', fontSize: 14 }}>
              <HiOutlineLogin style={{ width: 16, height: 16 }} /> Sign In
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-3"
            >
              {navLinks.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-1">{l.label}</a>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center mt-2">
                Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Grid bg */}
        <div className="absolute inset-0 hero-grid opacity-40" />
        {/* Blobs */}
        <div className="glow-ring float-slow" style={{ width: 480, height: 480, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', top: '-80px', left: '-120px' }} />
        <div className="glow-ring float-slow-2" style={{ width: 360, height: 360, background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', bottom: '-60px', right: '-80px' }} />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-7">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-700 border" style={{ background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe', fontWeight: 700 }}>
                  <span className="live-dot" />
                  Now live at 500+ institutions
                </span>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
                  Smarter Attendance
                  <br />
                  <span className="gradient-text">Powered by AI</span>
                </h1>
                <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-lg">
                  Real-time face recognition marks attendance in under 1 second — no cards, no roll calls, no proxies. Secured with blockchain and built for modern institutions.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
                <Link to="/login" className="btn-primary">
                  <HiOutlineLogin style={{ width: 18, height: 18 }} /> Start Free Trial
                </Link>
                <a href="#features" className="btn-ghost">
                  Explore Features <HiOutlineArrowRight style={{ width: 16, height: 16 }} />
                </a>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 text-sm text-gray-500 pt-1">
                {['14-day free trial', 'No credit card', 'GDPR compliant'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <HiOutlineCheckCircle style={{ width: 16, height: 16, color: '#10b981' }} /> {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right – Dashboard Preview */}
            <motion.div variants={fadeIn} initial="hidden" animate="show" className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200" style={{ background: '#0f172a' }}>
                {/* Window bar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-gray-400 font-medium">AttendanceAI – Live Dashboard</span>
                  <span className="ml-auto flex items-center gap-1.5"><span className="live-dot" /><span className="text-xs text-emerald-400">Active</span></span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Present', value: '1,247', icon: '🟢', change: '+3.2%' },
                      { label: 'Accuracy', value: '99.3%', icon: '🎯', change: 'Today' },
                      { label: 'Speed', value: '0.8s', icon: '⚡', change: 'Avg' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="text-xs text-gray-400">{s.label}</div>
                        <div className="text-lg font-bold text-white mt-0.5">{s.value}</div>
                        <div className="text-xs text-emerald-400 mt-0.5">{s.change}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-300">Weekly Attendance</span>
                      <span className="text-xs text-emerald-400">↑ 8% vs last week</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[62, 75, 80, 72, 88, 91, 94].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.4 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          style={{ height: `${h}%`, transformOrigin: 'bottom', flex: 1, borderRadius: 4, background: i === 6 ? 'linear-gradient(to top, #6366f1, #a5b4fc)' : 'rgba(165, 180, 252, 0.3)' }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                      {['M','T','W','T','F','S','S'].map((d,i) => <span key={i}>{d}</span>)}
                    </div>
                  </div>

                  {/* Recognition feed */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                      <HiOutlineEye style={{ width: 13, height: 13 }} /> Live recognition feed
                    </div>
                    {[
                      { name: 'Priya Sharma', time: '2s ago', conf: '99.1%' },
                      { name: 'Rahul Verma', time: '7s ago', conf: '97.8%' },
                      { name: 'Aisha Khan', time: '14s ago', conf: '98.4%' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300" style={{ background: 'rgba(99,102,241,0.25)' }}>
                          {r.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-200 truncate">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.time}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-emerald-400">{r.conf}</span>
                          <div className="live-dot" style={{ width: 6, height: 6, animation: 'none', background: '#10b981' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-2.5 shadow-xl border border-gray-100 flex items-center gap-2"
              >
                <span className="text-xl">🛡️</span>
                <div>
                  <div className="text-xs font-bold text-gray-900">Blockchain Secured</div>
                  <div className="text-xs text-gray-400">Tamper-proof records</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── METRICS ──────────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-gray-100" style={{ background: '#f8f7ff' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {metrics.map((m, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
                  {m.raw ? <span>{m.value}{m.suffix}</span> : <AnimatedNumber value={m.value} suffix={m.suffix} />}
                </div>
                <div className="mt-1.5 text-sm font-medium text-gray-500">{m.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">Core Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
              Everything you need,<br />nothing you don't
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-7"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="card-hover rounded-2xl p-7 border border-gray-100"
                style={{ background: 'linear-gradient(145deg, #fafafa, white)' }}
              >
                <div className={`feature-icon-bg-${f.color} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                  <f.icon className={`w-6 h-6 feature-icon-color-${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {f.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24" style={{ background: '#f8f7ff' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">Process</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
              From camera to record<br />in 4 steps
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              { icon: '📷', step: '01', title: 'Capture', desc: 'Live webcam stream opens for the class session.' },
              { icon: '🧠', step: '02', title: 'Detect & Embed', desc: 'FaceNet extracts a 128-D embedding in real time.' },
              { icon: '✅', step: '03', title: 'Verify & Match', desc: 'Liveness check + cosine similarity match is run.' },
              { icon: '📊', step: '04', title: 'Record & Analyse', desc: 'Result hashed to blockchain, dashboards update live.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-gray-100 relative card-hover"
              >
                <div className="text-3xl mb-4">{s.icon}</div>
                <div className="text-xs font-bold text-indigo-400 mb-1 tracking-widest">STEP {s.step}</div>
                <h4 className="text-base font-bold text-gray-900 mb-1.5">{s.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/3 -right-3 z-10">
                    <HiOutlineArrowRight className="w-5 h-5 text-indigo-200" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHO CAN USE ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">Roles</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
              Built for every stakeholder
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-7"
          >
            {roles.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="card-hover rounded-2xl overflow-hidden border border-gray-100"
              >
                <div className={`bg-gradient-to-br ${r.color} p-6`}>
                  <div className="text-4xl mb-2">{r.icon}</div>
                  <h3 className="text-xl font-bold text-white">{r.title}</h3>
                </div>
                <div className="p-6 bg-white space-y-3">
                  {r.items.map(item => (
                    <div key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BLOCKCHAIN SECURITY ──────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#0f172a' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-6">
              <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-indigo-400">Security & Trust</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
                Tamper-proof records,<br />always verifiable
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 leading-relaxed">
                Every attendance mark is cryptographically hashed and written to an immutable ledger. Institutions get verifiable proof without any operational overhead.
              </motion.p>

              <motion.div variants={stagger} className="space-y-3 pt-2">
                {[
                  { icon: HiOutlineCheckCircle, color: '#10b981', label: 'Record created & SHA-256 hashed' },
                  { icon: HiOutlineKey, color: '#6366f1', label: 'Signed with institution private key' },
                  { icon: HiOutlineDatabase, color: '#a78bfa', label: 'Written to immutable blockchain' },
                  { icon: HiOutlineDocumentReport, color: '#38bdf8', label: 'Full audit trail available on demand' },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <item.icon style={{ width: 20, height: 20, color: item.color, flexShrink: 0 }} />
                    <span className="text-sm text-gray-300">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Block visualiser */}
            <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-widest">Latest Block — #58,241</div>
                <div className="space-y-2.5">
                  {[
                    { student: 'Rahul Kumar', time: '09:30 AM', hash: '0x7a3f5e...' },
                    { student: 'Priya Singh', time: '09:32 AM', hash: '0x2b8d4a...' },
                    { student: 'Aditya Patel', time: '09:34 AM', hash: '0xc1e9f2...' },
                    { student: 'Neha Sharma', time: '09:36 AM', hash: '0x5f3d8c...' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div>
                        <div className="text-sm font-medium text-white">{r.student}</div>
                        <div className="text-xs text-gray-500">{r.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-emerald-400 bg-black/30 px-2 py-0.5 rounded">{r.hash}</code>
                        <span className="text-emerald-400 text-xs">✓</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div>
                    <div className="text-xs text-gray-500">Block hash</div>
                    <code className="text-xs text-emerald-400">0x2a4f8b9e7c1d3f5a...</code>
                  </div>
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
              Common questions
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} className="border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openFAQ === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <HiOutlineChevronDown className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFAQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
              Ready to eliminate<br />manual roll calls?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
              Join 500+ institutions that have switched to AI-powered attendance. Free 14-day trial — no credit card required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <HiOutlineLogin style={{ width: 18, height: 18 }} /> Start Free Trial
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
              >
                Learn more <HiOutlineArrowRight style={{ width: 16, height: 16 }} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                <HiOutlineFingerPrint style={{ width: 18, height: 18, color: 'white' }} />
              </div>
              <span className="text-white font-bold text-base" style={{ fontFamily: "'Sora', sans-serif" }}>AttendanceAI</span>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              {[...navLinks, { href: '/login', label: 'Login' }].map(l => (
                l.href.startsWith('#')
                  ? <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
                  : <Link key={l.href} to={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              ))}
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>© 2024 AttendanceAI. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <HiOutlineShieldCheck style={{ width: 14, height: 14, color: '#10b981' }} />
              <span>GDPR Compliant · AES-256 Encrypted · Blockchain Secured</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
