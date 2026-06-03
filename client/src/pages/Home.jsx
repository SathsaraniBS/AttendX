function Home() {
  const students = [
    { name: 'Kasun Perera', time: '08:30 AM', status: 'Present' },
    { name: 'Nimal Silva', time: '08:45 AM', status: 'Present' },
    { name: 'Sathsarani', time: '09:00 AM', status: 'Present' },
    { name: 'Amali Fernando', time: '-', status: 'Absent' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">
        🏠 Live Attendance
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Students', value: '24', icon: '👥', color: 'text-blue-400' },
          { label: 'Present Today', value: '18', icon: '✅', color: 'text-green-400' },
          { label: 'Absent Today', value: '6', icon: '❌', color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1a1a2e] rounded-2xl p-6 border border-cyan-400/20 text-center hover:border-cyan-400/50 transition-all">
            <div className="text-4xl mb-3">{stat.icon}</div>
            <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 mt-2 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Camera Card */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-cyan-400/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            📷 <span>Live Camera Feed</span>
          </h2>
          <div className="bg-black rounded-xl h-72 flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/30">
            <span className="text-6xl mb-4">📸</span>
            <p className="text-gray-500 text-sm">Camera initializing...</p>
          </div>
          <button className="mt-4 w-full py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 active:scale-95 transition-all duration-200 text-lg">
            🎯 Start Recognition
          </button>
        </div>

        {/* Attendance Table */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-cyan-400/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            📋 <span>Today's Attendance</span>
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {students.map((s, i) => (
              <div key={i} className="flex justify-between items-center bg-[#0f0f1a] px-4 py-3 rounded-xl border border-cyan-400/10 hover:border-cyan-400/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold">
                    {s.name[0]}
                  </div>
                  <span className="text-white text-sm font-medium">{s.name}</span>
                </div>
                <span className="text-gray-400 text-xs">{s.time}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  s.status === 'Present'
                    ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                    : 'bg-red-400/10 text-red-400 border border-red-400/30'
                }`}>
                  {s.status === 'Present' ? '✅ Present' : '❌ Absent'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-cyan-400/10 flex justify-between text-sm text-gray-400">
            <span>📅 Today: June 3, 2026</span>
            <span className="text-cyan-400 cursor-pointer hover:underline">View All →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;