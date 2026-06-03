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
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT SIDE — Dark Blue Panel */}
        <div className="hidden lg:flex w-1/2 bg-[#0a1628] flex-col items-center justify-between p-10 relative overflow-hidden">

          {/* Background wave effect */}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20">
            <svg viewBox="0 0 400 150" className="w-full">
              <path d="M0,100 C150,200 350,0 400,100 L400,150 L0,150 Z" fill="#00d4ff"/>
              <path d="M0,120 C100,60 300,180 400,80 L400,150 L0,150 Z" fill="#0066ff" opacity="0.5"/>
            </svg>
          </div>

          {/* Face scan animation */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-56 h-56">

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>

              {/* Face SVG */}
              <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                {/* Head outline */}
                <ellipse cx="100" cy="95" rx="55" ry="65" stroke="#1e90ff" strokeWidth="1.5" strokeDasharray="4 2"/>

                {/* Face mesh dots */}
                {[
                  [100,40],[80,55],[120,55],[70,70],[100,70],[130,70],
                  [65,90],[100,90],[135,90],[75,110],[100,110],[125,110],
                  [85,130],[100,130],[115,130],[100,150]
                ].map(([cx,cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="2.5" fill="#00d4ff" opacity="0.8"/>
                ))}

                {/* Mesh lines */}
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

                {/* Eyes */}
                <ellipse cx="82" cy="88" rx="8" ry="5" stroke="#00d4ff" strokeWidth="1.5"/>
                <ellipse cx="118" cy="88" rx="8" ry="5" stroke="#00d4ff" strokeWidth="1.5"/>
                <circle cx="82" cy="88" r="2.5" fill="#00d4ff"/>
                <circle cx="118" cy="88" r="2.5" fill="#00d4ff"/>

                {/* Nose */}
                <path d="M100 95 L94 112 Q100 116 106 112 Z" stroke="#1e90ff" strokeWidth="1" fill="none" opacity="0.7"/>

                {/* Mouth */}
                <path d="M88 125 Q100 133 112 125" stroke="#00d4ff" strokeWidth="1.5" fill="none"/>

                {/* Scan line */}
                <line x1="45" y1="95" x2="155" y2="95" stroke="#00d4ff" strokeWidth="1" opacity="0.4" strokeDasharray="3 2"/>
              </svg>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-white text-2xl font-bold mb-1">Face Recognition</h2>
            <h3 className="text-cyan-400 text-2xl font-bold mb-4">Attendance System</h3>
            <p className="text-gray-400 text-sm tracking-widest">Smart • Secure • Accurate</p>
          </div>

          {/* Bottom info */}
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-3 border border-white/10 relative z-10">
            <span className="text-2xl">🛡️</span>
            <p className="text-gray-300 text-xs leading-relaxed">
              Advanced AI technology for<br/>secure and accurate attendance tracking
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-10">

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back!</h1>
          <p className="text-gray-400 text-sm mb-8">Login to your account to continue</p>

          {/* Error */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">

            {/* Email */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-300"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-300"
                  required
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500"/>
                <span className="text-gray-500 text-sm">Remember me</span>
              </label>
              <button type="button" className="text-blue-500 text-sm hover:underline font-medium">
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 disabled:opacity-70">
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

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Google Button */}
            <button type="button"
              className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

          </form>

          {/* Sign up */}
          <p className="mt-6 text-gray-400 text-sm">
            Don't have an account?{' '}
            <button className="text-blue-500 font-medium hover:underline">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}