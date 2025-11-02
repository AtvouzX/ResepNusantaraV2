// src/components/makanan/RecipeGrid.jsx
import { Clock, Star, ChefHat, Share2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FavoriteButton from '../common/FavoriteButton';

export default function RecipeGrid({ recipes, onRecipeClick, showHeader = true, onFavoriteToggle }) {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  const [copiedIds, setCopiedIds] = useState([]);

  useEffect(() => {

    cardRefs.current = cardRefs.current.slice(0, recipes.length);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);

          setTimeout(() => {
            setVisibleCards(prev => new Set(prev).add(index));
          }, (index % 3) * 150);
        }
      });
    }, { threshold: 0.1 });

    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.dataset.index = index;
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [recipes]);

  return (
    <section>
      {showHeader && (
        <>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 text-center mb-4">
            Jelajahi Resep Makanan
          </h1>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-8">
            Temukan inspirasi masakan Nusantara favoritmu. Dari hidangan utama hingga camilan, semua ada di sini.
          </p>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {recipes.map((recipe, index) => (
          <div
            key={recipe.id}
            ref={el => cardRefs.current[index] = el}
            className={`group transform transition-all duration-700 ${visibleCards.has(index)
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
              }`}
          >

            <div
              onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
              className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/15 transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-32 md:h-56 overflow-hidden">
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Favorite Button */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  <FavoriteButton recipeId={recipe.id} size="sm" onToggle={(id, isFavorited) => {
                    if (onFavoriteToggle) onFavoriteToggle(id, isFavorited);
                  }} />
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const link = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
                      try {
                        await navigator.clipboard.writeText(link);
                      } catch {
                        const ta = document.createElement('textarea');
                        ta.value = link;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                      }
                      setCopiedIds(prev => Array.from(new Set([...prev, recipe.id])));
                      setTimeout(() => setCopiedIds(prev => prev.filter(i => i !== recipe.id)), 2000);
                    }}
                    title="Salin tautan resep"
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-600 flex items-center justify-center shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copiedIds.includes(recipe.id) && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">Tersalin</span>
                  )}
                </div>
              </div>
              <div className="relative z-10 p-4 md:p-8">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100/90 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                    Makanan
                  </span>
                  {recipe.average_rating > 0 && (
                    <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                      <span className="text-xs md:text-sm font-semibold text-slate-700">{recipe.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 mb-3 md:mb-4 text-base md:text-xl group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {recipe.name}
                </h3>
                <div className="flex items-center justify-between text-xs md:text-sm text-slate-600">
                  <div className="flex items-center space-x-1 md:space-x-2 bg-white/70 px-2 md:px-3 py-1 md:py-2 rounded-full">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="font-medium">{recipe.prep_time}</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 bg-white/70 px-2 md:px-3 py-1 md:py-2 rounded-full">
                    <ChefHat className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="font-medium">{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {recipes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">Resep tidak ditemukan. Coba kata kunci lain.</p>
        </div>
      )}
    </section>
  );
}

RecipeGrid.propTypes = {
  recipes: PropTypes.array.isRequired,
  onRecipeClick: PropTypes.func,
};

RecipeGrid.defaultProps = {
  showHeader: true,
};

RecipeGrid.propTypes = {
  recipes: PropTypes.array.isRequired,
  onRecipeClick: PropTypes.func,
  showHeader: PropTypes.bool,
  onFavoriteToggle: PropTypes.func,
};
