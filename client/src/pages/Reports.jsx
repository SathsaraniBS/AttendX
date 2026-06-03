function Reports() {
  const records = [
    { id: 1, name: 'Kasun Perera', date: '2026-06-03', time: '08:30', status: 'Present' },
    { id: 2, name: 'Nimal Silva', date: '2026-06-03', time: '08:45', status: 'Present' },
    { id: 3, name: 'Amali Fernando', date: '2026-06-03', time: '-', status: 'Absent' },
    { id: 4, name: 'Sathsarani BS', date: '2026-06-03', time: '09:00', status: 'Present' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">📊 Attendance Reports</h1>

      {/* Filter Bar */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-cyan-400/20 mb-6 flex gap-4 items-center">
        <input
          type="date"
          className="bg-[#0f0f1a] border border-cyan-400/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          defaultValue="2026-06-03"
        />
        <select className="bg-[#0f0f1a] border border-cyan-400/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
          <option>All Students</option>
          <option>Present Only</option>
          <option>Absent Only</option>
        </select>
        <button className="px-6 py-2 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all">
          🔍 Filter
        </button>
        <button className="px-6 py-2 bg-green-500/20 text-green-400 border border-green-400/30 font-bold rounded-xl hover:bg-green-500/30 transition-all ml-auto">
          📥 Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-cyan-400/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-cyan-400/10 border-b border-cyan-400/20">
              <th className="text-left px-6 py-4 text-cyan-400 font-semibold">#</th>
              <th className="text-left px-6 py-4 text-cyan-400 font-semibold">Name</th>
              <th className="text-left px-6 py-4 text-cyan-400 font-semibold">Date</th>
              <th className="text-left px-6 py-4 text-cyan-400 font-semibold">Time</th>
              <th className="text-left px-6 py-4 text-cyan-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all">
                <td className="px-6 py-4 text-gray-400">{r.id}</td>
                <td className="px-6 py-4 text-white font-medium">{r.name}</td>
                <td className="px-6 py-4 text-gray-400">{r.date}</td>
                <td className="px-6 py-4 text-gray-400">{r.time}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    r.status === 'Present'
                      ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                      : 'bg-red-400/10 text-red-400 border border-red-400/30'
                  }`}>
                    {r.status === 'Present' ? '✅ Present' : '❌ Absent'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;