// src/pages/FavoritesPage.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import recipeService from '../services/recipeService';
import RecipeGrid from '../components/makanan/RecipeGrid';

export default function FavoritesPage({ onRecipeClick }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!favIds || favIds.length === 0) {
          if (mounted) {
            setRecipes([]);
            setLoading(false);
          }
          return;
        }

        const promises = favIds.map((id) => recipeService.getRecipeById(id).catch((e) => ({ success: false, message: e.message })));
        const results = await Promise.all(promises);

        const fetched = results
          .map((res) => {
            // res may be { success, data } or raw data object depending on API wrapper
            if (!res) return null;
            if (res.success && res.data) return res.data;
            if (res.data) return res.data;
            if (res.success && !res.data && res.recipe) return res.recipe;
            return res;
          })
          .filter(Boolean);

        if (mounted) {
          setRecipes(fetched);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Gagal memuat favorit');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-amber-50 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Favorit Saya</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Kumpulan resep yang sudah kamu tandai sebagai favorit</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Memuat favorit...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold mb-2">Terjadi Kesalahan</p>
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Belum ada resep favorit.</p>
            <p className="text-gray-500 mt-2">Jelajahi resep dan beri tanda favorit pada resep yang kamu suka.</p>
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <RecipeGrid
            recipes={recipes}
            onRecipeClick={onRecipeClick}
            showHeader={false}
            onFavoriteToggle={(id, isFavorited) => {
              // If unfavorited, remove immediately from the favorites list
              if (!isFavorited) {
                setRecipes((prev) => prev.filter(r => String(r.id) !== String(id)));
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

FavoritesPage.propTypes = {
  onRecipeClick: PropTypes.func,
};
