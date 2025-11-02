// src/pages/ProfilePage.jsx
export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Profile Pengguna
        </h1>
        <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-xl p-8 text-center max-w-md mx-auto">
          <img
            src="https://avatars.githubusercontent.com/atvouzx"
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border-4 border-white/50"
          />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Faiz Abdul Hanif</h2>
          <p className="text-slate-600 mb-6">21120123140138</p>
            <p className="text-slate-600 mb-6">Kelompok 21</p>
        </div>
      </div>
    </div>
  );
}
