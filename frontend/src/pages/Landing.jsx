import { Link } from 'react-router-dom';
import {
  HiOutlineLogin,
  HiOutlineInformationCircle,
  HiOutlineVideoCamera,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineLockClosed,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

export default function Landing() {
  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center p-12 md:p-20 text-white">
          <div className="inline-block mb-6 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
            🚀 AI-Powered Attendance Management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Digital ID Attendance<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Reimagined with AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto">
            Transform your institution with cutting-edge facial recognition technology. 
            Mark attendance in seconds, not minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/login"
              className="group bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-3"
            >
              <HiOutlineLogin className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              Get Started Free
            </Link>
            <a
              href="#features"
              className="group bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/50 hover:bg-white/30 transition-all flex items-center gap-3"
            >
              <HiOutlineInformationCircle className="w-6 h-6" />
              Explore Features
            </a>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: '99.9%', label: 'Accuracy Rate', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
          { value: '< 1s', label: 'Processing Time', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
          { value: '24/7', label: 'System Uptime', icon: '🔒', color: 'from-green-500 to-emerald-500' },
          { value: '100%', label: 'Contactless', icon: '✨', color: 'from-purple-500 to-pink-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div id="features" className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            ✨ Why Choose Our System?
          </h2>
          <p className="text-xl text-gray-600">Powerful features designed for modern institutions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <HiOutlineVideoCamera className="w-12 h-12 text-white" />,
              gradient: 'from-blue-500 via-cyan-500 to-teal-500',
              title: 'AI Face Recognition',
              desc: 'Advanced FaceNet technology recognizes faces with 99.9% accuracy, even in varying lighting conditions.',
              features: ['Mask detection', 'Multiple angles', 'Anti-spoofing'],
            },
            {
              icon: <HiOutlineLightningBolt className="w-12 h-12 text-white" />,
              gradient: 'from-yellow-500 via-orange-500 to-red-500',
              title: 'Real-time Processing',
              desc: 'Instant attendance updates with live synchronization across all devices and dashboards.',
              features: ['< 1 second scan', 'Offline support', 'Auto-sync'],
            },
            {
              icon: <HiOutlineChartBar className="w-12 h-12 text-white" />,
              gradient: 'from-purple-500 via-pink-500 to-rose-500',
              title: 'Smart Analytics',
              desc: 'Comprehensive dashboards with visual insights, trends, and automated reports.',
              features: ['Visual charts', 'Trend analysis', 'Export reports'],
            },
          ].map((f, i) => (
            <div key={i} className="group bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className={`bg-gradient-to-br ${f.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{f.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{f.desc}</p>
              <div className="space-y-2">
                {f.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Speed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <HiOutlineLockClosed className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">Bank-Level Security</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Your biometric data is encrypted and stored as mathematical vectors, not images. 
              GDPR compliant with end-to-end encryption.
            </p>
            <div className="flex gap-3 flex-wrap">
              {['End-to-end encryption', 'GDPR compliant', 'No image storage'].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <HiOutlineClock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">Lightning Fast</h3>
            </div>
            <p className="text-cyan-100 text-lg leading-relaxed mb-6">
              Mark attendance in under 1 second with our optimized AI algorithms and pre-computed face embeddings.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '< 1s', label: 'Scan Time' },
                { value: '99.9%', label: 'Accuracy' },
                { value: '0ms', label: 'Latency' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-cyan-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            👥 Built for Everyone
          </h2>
          <p className="text-xl text-gray-600">Tailored experiences for each user role</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <HiOutlineAcademicCap className="w-10 h-10" />,
              color: 'blue', 
              title: 'Students', 
              items: ['View attendance history', 'Track percentage', 'Visual analytics', 'Download reports'],
            },
            { 
              icon: <HiOutlineUserGroup className="w-10 h-10" />,
              color: 'green', 
              title: 'Faculty', 
              items: ['Mark via face scan', 'Class records', 'Search history', '5-min window'],
            },
            { 
              icon: <HiOutlineOfficeBuilding className="w-10 h-10" />,
              color: 'purple', 
              title: 'Administrators', 
              items: ['Manage users', 'System monitoring', 'Analytics', 'Full control'],
            },
          ].map((r, i) => (
            <div key={i} className="group bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className={`w-20 h-20 bg-gradient-to-br from-${r.color}-100 to-${r.color}-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform text-${r.color}-600`}>
                {r.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{r.title}</h3>
              <ul className="text-left space-y-3">
                {r.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-600">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            🚀 Modern Tech Stack
          </h2>
          <p className="text-xl text-gray-600">Built with cutting-edge technologies</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Python', sub: 'Backend', grad: 'from-green-400 to-emerald-500', code: '🐍' },
            { label: 'Django', sub: 'Framework', grad: 'from-green-600 to-green-700', code: '🎯' },
            { label: 'FaceNet', sub: 'AI Model', grad: 'from-orange-400 to-red-500', code: '🧠' },
            { label: 'React', sub: 'Frontend', grad: 'from-blue-400 to-indigo-500', code: '⚛️' },
          ].map((t, i) => (
            <div key={i} className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all">
              <div className={`bg-gradient-to-br ${t.grad} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <span className="text-4xl">{t.code}</span>
              </div>
              <p className="font-bold text-gray-800 text-lg">{t.label}</p>
              <p className="text-sm text-gray-500">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 md:p-16 text-center text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of institutions already using AI-powered attendance management
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 bg-white text-indigo-600 px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            <HiOutlineLogin className="w-6 h-6" />
            Start Free Trial
          </Link>
          <p className="mt-6 text-indigo-200 text-sm">No credit card required • Setup in 5 minutes</p>
        </div>
      </div>
    </div>
  );
}
