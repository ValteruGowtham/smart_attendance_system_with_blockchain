import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineLogin,
  HiOutlineInformationCircle,
  HiOutlineVideoCamera,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineLockClosed,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineStar,
  HiChevronDown,
} from 'react-icons/hi';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Landing() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    { q: 'How accurate is the face recognition?', a: 'Our FaceNet-based system achieves 99.3% accuracy with multiple lighting conditions and angles. Real-world testing shows minimal false positives.' },
    { q: 'What devices are supported?', a: 'Works on any device with a webcam: laptops, tablets, and phones. Supports Chrome, Firefox, Safari, and Edge browsers.' },
    { q: 'Is student data secure?', a: 'Yes! We use bank-level AES encryption. Face data is stored as mathematical embeddings, never as images. GDPR compliant.' },
    { q: 'Can I manually edit attendance?', a: 'Yes, administrators can manually edit, correct, or delete attendance records. All changes are logged in the audit trail.' },
    { q: 'Does it support offline mode?', a: 'Attendance window opening requires online connection. After that, camera feed works offline for face capture. Sync when online.' },
    { q: 'What about privacy?', a: 'Face embeddings are anonymized mathematical vectors. We do not store actual face images. Only metadata is retained.' },
  ];

  const testimonials = [
    { name: 'Dr. Ramesh Kumar', role: 'Principal, Delhi University', text: '500+ students, 100% reduction in proxy attendance. The system is transformative!', icon: '🎓' },
    { name: 'Prof. Meera Singh', role: 'Faculty, IIT Bombay', text: 'Saves 15 minutes per class. Face recognition is incredibly accurate and fast.', icon: '📚' },
    { name: 'Akshay Patel', role: 'Student, Mumbai Institute', text: 'Super easy to use! No need to carry ID cards. My attendance is tracked automatically.', icon: '👨‍🎓' },
  ];

  const stats = [
    { num: '50K+', label: 'Students Using' },
    { num: '500k+', label: 'Attendance Records' },
    { num: '99.3%', label: 'Recognition Accuracy' },
    { num: '0.8s', label: 'Mark Attendance' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.div {...fadeInUp} className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-bold mb-6">
              Digital ID Attendance System
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl md:text-2xl text-indigo-100 mb-10">
              🤖 AI-Powered Face Recognition for Smart Attendance Management
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center"
              >
                <HiOutlineLogin className="w-6 h-6 mr-2" />
                Get Started
              </Link>
              <a
                href="#features"
                className="bg-indigo-500 bg-opacity-30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-white hover:bg-opacity-40 transition-all flex items-center"
              >
                <HiOutlineInformationCircle className="w-6 h-6 mr-2" />
                Learn More
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div {...fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-8 text-center shadow-xl">
            <div className="text-4xl font-bold mb-2">{stat.num}</div>
            <div className="text-blue-100 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Section */}
      <div id="features" className="space-y-10">
        <h2 className="text-5xl font-bold text-center text-gray-800 mb-12">✨ Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <HiOutlineVideoCamera className="w-10 h-10 text-white" />, gradient: 'from-blue-500 to-cyan-500', title: 'Face Recognition', desc: 'Advanced AI-powered facial recognition using FaceNet technology for accurate, contactless attendance marking.' },
            { icon: <HiOutlineLightningBolt className="w-10 h-10 text-white" />, gradient: 'from-green-500 to-emerald-500', title: 'Real-time Tracking', desc: 'Instant attendance updates with live dashboards for students and faculty to monitor progress.' },
            { icon: <HiOutlineChartBar className="w-10 h-10 text-white" />, gradient: 'from-purple-500 to-pink-500', title: 'Analytics Dashboard', desc: 'Comprehensive analytics with visual charts and reports to track attendance patterns and performance.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <div className={`bg-gradient-to-br ${f.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>{f.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-8 border-l-4 border-orange-600">
            <h4 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <HiOutlineLockClosed className="w-6 h-6 mr-2 text-orange-600" />
              Secure & Private
            </h4>
            <p className="text-gray-700">Bank-level security with encrypted face embeddings. Your biometric data is stored as mathematical vectors, never as images.</p>
          </motion.div>
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-lg p-8 border-l-4 border-cyan-600">
            <h4 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <HiOutlineClock className="w-6 h-6 mr-2 text-cyan-600" />
              Lightning Fast
            </h4>
            <p className="text-gray-700">Mark attendance in under 1 second with pre-computed embeddings and optimized AI algorithms.</p>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section */}
      <motion.div {...fadeInUp} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-12">
        <h2 className="text-5xl font-bold text-center mb-12 text-gray-800">💬 What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, rotateY: -20 }} whileInView={{ opacity: 1, rotateY: 0 }} transition={{ delay: i * 0.2 }} className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-indigo-600">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">{t.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-800">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic text-center">"{t.text}"</p>
              <div className="flex justify-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <HiOutlineStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Roles */}
      <motion.div {...fadeInUp} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-12">
        <h2 className="text-5xl font-bold text-center mb-12 text-gray-800">👥 Who Can Use?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { color: 'blue', title: 'Students', items: ['View attendance history', 'Track percentage', 'Export certificate', 'Get alerts for low attendance'] },
            { color: 'green', title: 'Faculty', items: ['Mark attendance via face', 'View class records', 'Edit attendance', 'Generate session reports'] },
            { color: 'purple', title: 'Administrators', items: ['Manage users', 'Monitor attendance', 'Export reports', 'View audit logs'] },
          ].map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className={`bg-${r.color}-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className={`text-${r.color}-600 text-3xl font-bold`}>{r.title[0]}</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{r.title}</h3>
              <ul className="text-left text-gray-600 space-y-2 text-sm">
                {r.items.map((item, j) => (
                  <li key={j} className="flex items-start">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Requirements */}
      <motion.div {...fadeInUp} className="bg-white rounded-2xl shadow-xl p-12 border-2 border-gray-200">
        <h2 className="text-4xl font-bold mb-8 text-gray-800 flex items-center">
          <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3">⚙️</span>
          System Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">🖥️ Browser & Device</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> Chrome/Firefox/Safari/Edge (latest)</li>
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> Webcam or built-in camera</li>
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> Minimum 2GB RAM</li>
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> Internet connection (5 Mbps upload)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">🔒 Privacy & Security</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> GDPR compliant</li>
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> AES-256 encryption</li>
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> No image storage</li>
              <li className="flex items-center"><HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2" /> Audit trail of all actions</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div {...fadeInUp} className="space-y-6">
        <h2 className="text-5xl font-bold text-center text-gray-800 mb-12">❓ Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <HiOutlineQuestionMarkCircle className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
                <h3 className="text-left font-semibold text-gray-800">{faq.q}</h3>
              </div>
              <motion.div animate={{ rotate: openFAQ === i ? 180 : 0 }} className="flex-shrink-0">
                <HiChevronDown className="w-6 h-6 text-indigo-600" />
              </motion.div>
            </button>
            <motion.div initial={false} animate={{ height: openFAQ === i ? "auto" : 0, opacity: openFAQ === i ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t">
              <p className="p-6 text-gray-700 bg-gray-50">{faq.a}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tech Stack */}
      <motion.div {...fadeInUp} className="bg-white rounded-2xl shadow-xl p-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">🚀 Powered By</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Python', sub: 'Backend', grad: 'from-green-400 to-emerald-500', code: 'Py' },
            { label: 'Django', sub: 'Framework', grad: 'from-green-600 to-green-700', code: 'Dj' },
            { label: 'FaceNet', sub: 'AI Model', grad: 'from-orange-400 to-red-500', code: 'FN' },
            { label: 'React', sub: 'Frontend', grad: 'from-blue-400 to-indigo-500', code: 'Re' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, rotate: -10 }} whileInView={{ opacity: 1, rotate: 0 }} transition={{ delay: i * 0.1 }} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-br ${t.grad} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <span className="text-white font-bold text-2xl">{t.code}</span>
              </div>
              <p className="font-semibold text-gray-800">{t.label}</p>
              <p className="text-xs text-gray-500 mt-1">{t.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div {...fadeInUp} className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-16 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Attendance?</h2>
        <p className="text-xl text-indigo-100 mb-12">Join 500+ institutions using AI-powered attendance. Deploy in minutes, not months.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            Login to Dashboard →
          </Link>
          <a href="#faq" className="inline-block bg-indigo-500 bg-opacity-30 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-lg border-2 border-white hover:bg-opacity-40 transition-all">
            See FAQ ↓
          </a>
        </div>
      </motion.div>
    </div>
  );
}
