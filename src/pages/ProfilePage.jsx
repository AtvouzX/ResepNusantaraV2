// src/pages/ProfilePage.jsx
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import LazyImage from '../components/common/LazyImage';
import FavoritesPage from './FavoritesPage';
import RecipeDetail from '../components/recipe/RecipeDetail';
import { getUserProfile, updateAvatar, updateUsername, saveUserProfile } from '../services/userService';

export default function ProfilePage({ showFavoritesInitially = true }) {
  const [profile, setProfile] = useState(() => getUserProfile());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username || '');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [showFavorites] = useState(showFavoritesInitially);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setNameInput(profile.username || '');
  }, [profile.username]);

  const handleEditToggle = () => {
    setEditingName((s) => !s);
    setNameInput(profile.username || '');
  };

  const handleSaveName = () => {
    const trimmed = (nameInput || '').trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      const res = updateUsername(trimmed);
      if (res && res.success) {
        setProfile(res.data);
        setEditingName(false);
      } else {
        alert(res.message || 'Gagal menyimpan nama');
      }
    } finally {
      setSavingName(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // simple size guard: avoid huge files
    if (file.size > 2 * 1024 * 1024) {
      if (!confirm('Ukuran gambar lebih dari 2MB. Lanjutkan?')) return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const res = updateAvatar(base64);
        if (res && res.success) {
          setProfile(res.data);
        } else {
          alert(res.message || 'Gagal memperbarui avatar');
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setUploading(false);
        alert('Gagal membaca file gambar');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      alert(err.message || 'Gagal mengunggah avatar');
    }
  };

  const triggerFile = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const handleSaveProfile = () => {
    const res = saveUserProfile(profile);
    if (res && res.success) {
      setProfile(res.data);
      alert('Profil disimpan');
    } else {
      alert(res.message || 'Gagal menyimpan profil');
    }
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Profile Pengguna</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveProfile}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >Simpan</button>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white/50">
                <LazyImage src={profile.avatar || 'https://avatars.githubusercontent.com/atvouzx'} alt="Avatar" className="w-32 h-32 object-cover" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="mt-2 text-center">
                <button onClick={triggerFile} className="px-3 py-2 bg-white rounded-lg border">{uploading ? 'Mengunggah...' : 'Ubah Foto'}</button>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {!editingName ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{profile.username}</h2>
                  <div className="text-slate-600 mb-4">{profile.userId}</div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <button onClick={handleEditToggle} className="px-3 py-2 bg-white border rounded-lg">Edit Nama</button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-4 py-2 rounded-lg border" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} disabled={savingName} className="px-3 py-2 bg-blue-600 text-white rounded-lg">{savingName ? 'Menyimpan...' : 'Simpan'}</button>
                    <button onClick={handleEditToggle} className="px-3 py-2 bg-white border rounded-lg">Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-slate-600 mt-6">{profile.bio}</p>
          )}
        </div>

        <div className="mt-8">
          {showFavorites && (
            // Render FavoritesPage but intercept clicks to open inline detail
            <FavoritesPage onRecipeClick={(id) => {
              // open inline detail modal inside profile
              setSelectedRecipeId(id);
              setDetailOpen(true);
            }} />
          )}
        </div>

        {/* Inline recipe detail modal for seamless reviews */}
        {detailOpen && selectedRecipeId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 md:p-8">
            <div className="bg-transparent w-full max-w-5xl rounded-xl shadow-xl overflow-auto max-h-[90vh]">
              <RecipeDetail recipeId={selectedRecipeId} onBack={() => {
                setDetailOpen(false);
                setSelectedRecipeId(null);
              }} onEdit={null} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ProfilePage.propTypes = {
  onRecipeClick: PropTypes.func,
  showFavoritesInitially: PropTypes.bool,
};
