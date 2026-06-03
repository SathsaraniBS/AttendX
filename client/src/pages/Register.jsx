function Register() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">📝 Register Student</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">

        {/* Camera Capture */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-cyan-400/20">
          <h2 className="text-xl font-semibold text-white mb-4">📷 Capture Photo</h2>
          <div className="bg-black rounded-xl h-72 flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/30">
            <span className="text-6xl mb-4">🤳</span>
            <p className="text-gray-500 text-sm">Position face in frame</p>
          </div>
          <button className="mt-4 w-full py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all">
            📸 Capture
          </button>
        </div>

        {/* Student Form */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-cyan-400/20">
          <h2 className="text-xl font-semibold text-white mb-6">👤 Student Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Full Name', placeholder: 'Kasun Perera', type: 'text' },
              { label: 'Student ID', placeholder: 'ST001', type: 'text' },
              { label: 'Email', placeholder: 'kasun@gmail.com', type: 'email' },
            ].map((field, i) => (
              <div key={i}>
                <label className="text-gray-400 text-sm mb-2 block">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full bg-[#0f0f1a] border border-cyan-400/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            ))}
            <button className="w-full py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all mt-4 text-lg">
              ✅ Register Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;