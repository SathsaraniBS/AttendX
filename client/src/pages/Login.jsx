import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter email and password!');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email: form.email, password: form.password }
      );

      const { token, role, name, student } = res.data;

      // ✅ Save token + user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        name, role, email: form.email
      }));

      // ✅ Remember me — email save කරනවා
      if (remember) {
        localStorage.setItem('remembered_email', form.email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // ✅ Student data save
      if (role === 'student' && student) {
        localStorage.setItem('student_token', token);
        localStorage.setItem('student_user', JSON.stringify(student));
      }

      // ✅ Role based redirect
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        setError('Unknown role. Please contact admin.');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* ===== LEFT SIDE ===== */}
        <div className="hidden lg:flex w-1/2 bg-[#0a1628] flex-col items-center justify-between p-10 relative overflow-hidden">

          {/* Wave Background */}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20">
            <svg viewBox="0 0 400 150" className="w-full">
              <path d="M0,100 C150,200 350,0 400,100 L400,150 L0,150 Z" fill="#00d4ff"/>
              <path d="M0,120 C100,60 300,180 400,80 L400,150 L0,150 Z" fill="#0066ff" opacity="0.5"/>
            </svg>
          </div>

          {/* Face SVG Illustration */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-56 h-56">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"/>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"/>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"/>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"/>
              <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                <ellipse cx="100" cy="95" rx="55" ry="65" stroke="#1e90ff" strokeWidth="1.5" strokeDasharray="4 2"/>
                {[
                  [100,40],[80,55],[120,55],[70,70],[100,70],[130,70],
                  [65,90],[100,90],[135,90],[75,110],[100,110],[125,110],
                  [85,130],[100,130],[115,130],[100,150]
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="2.5" fill="#00d4ff" opacity="0.8"/>
                ))}
                <line x1="100" y1="40" x2="80" y2="55" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="100" y1="40" x2="120" y2="55" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="80" y1="55" x2="70" y2="70" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="120" y1="55" x2="130" y2="70" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="70" y1="70" x2="65" y2="90" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="130" y1="70" x2="135" y2="90" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="65" y1="90" x2="75" y2="110" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="135" y1="90" x2="125" y2="110" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="75" y1="110" x2="85" y2="130" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="125" y1="110" x2="115" y2="130" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="85" y1="130" x2="100" y2="150" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="115" y1="130" x2="100" y2="150" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="80" y1="55" x2="100" y2="70" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="120" y1="55" x2="100" y2="70" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="70" y1="70" x2="100" y2="70" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="130" y1="70" x2="100" y2="70" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="65" y1="90" x2="100" y2="90" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="135" y1="90" x2="100" y2="90" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="75" y1="110" x2="100" y2="110" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <line x1="125" y1="110" x2="100" y2="110" stroke="#1e90ff" strokeWidth="0.8" opacity="0.5"/>
                <ellipse cx="82" cy="88" rx="8" ry="5" stroke="#00d4ff" strokeWidth="1.5"/>
                <ellipse cx="118" cy="88" rx="8" ry="5" stroke="#00d4ff" strokeWidth="1.5"/>
                <circle cx="82" cy="88" r="2.5" fill="#00d4ff"/>
                <circle cx="118" cy="88" r="2.5" fill="#00d4ff"/>
                <path d="M100 95 L94 112 Q100 116 106 112 Z" stroke="#1e90ff" strokeWidth="1" fill="none" opacity="0.7"/>
                <path d="M88 125 Q100 133 112 125" stroke="#00d4ff" strokeWidth="1.5" fill="none"/>
                <line x1="45" y1="95" x2="155" y2="95" stroke="#00d4ff" strokeWidth="1" opacity="0.4" strokeDasharray="3 2"/>
              </svg>
            </div>
          </div>

          {/* Branding */}
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-white text-2xl font-bold mb-1">Face Recognition</h2>
            <h3 className="text-cyan-400 text-2xl font-bold mb-4">Attendance System</h3>
            <p className="text-gray-400 text-sm tracking-widest">Smart • Secure • Accurate</p>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-3 border border-white/10 relative z-10">
            <span className="text-2xl">🛡️</span>
            <p className="text-gray-300 text-xs leading-relaxed">
              Advanced AI technology for<br/>secure and accurate attendance tracking
            </p>
          </div>
        </div>

        {/* ===== RIGHT SIDE — Login Form ===== */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-10">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back!</h1>
          <p className="text-gray-400 text-sm mb-8">Login to your account to continue</p>

          {/* ✅ Error Message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">

            {/* Email */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-300"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-300"
                  required
                  autoComplete="current-password"
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"/>
                <span className="text-gray-500 text-sm">Remember me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>

          </form>

          {/* Footer note */}
          <p className="mt-8 text-gray-400 text-xs text-center">
            AttendX — Face Recognition Attendance System
          </p>
        </div>

      </div>
    </div>
  );
}