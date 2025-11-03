import { apiClient } from '../config/api';

class RecipeService {
    /**
     * Get all recipes with optional filters
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 10)
     * @param {string} params.category - Filter by category: 'makanan' | 'minuman'
     * @param {string} params.difficulty - Filter by difficulty: 'mudah' | 'sedang' | 'sulit'
     * @param {string} params.search - Search in name/description
     * @param {string} params.sort_by - Sort by field (default: 'created_at')
     * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
     * @returns {Promise}
     */
    async getRecipes(params = {}) {
        return await apiClient.get('/api/v1/recipes', { params });
    }

    /**
     * Get recipe by ID
     * @param {string} id - Recipe ID
     * @returns {Promise}
     */
    async getRecipeById(id) {
        const result = await apiClient.get(`/api/v1/recipes/${id}`);

        // If the API returns a wrapper { success, data }, extract the recipe object
        let raw = result;
        if (!raw) return raw;

        let recipe = null;
        if (raw.success && raw.data) recipe = raw.data;
        else if (raw.data) recipe = raw.data;
        else if (raw.recipe) recipe = raw.recipe;
        else recipe = raw;

        // Normalization helper: ensure common fields exist and are in predictable shapes
        const normalizeRecipe = (r) => {
            if (!r || typeof r !== 'object') return r;

            // Image
            const image_url = r.image_url || r.image || r.imageUrl || '';

            // Ingredients -> array of { id?, name, quantity }
            let ingredients = [];
            if (Array.isArray(r.ingredients)) {
                ingredients = r.ingredients.map((ing) => {
                    if (!ing) return { name: '', quantity: '' };
                    if (typeof ing === 'string') return { name: ing, quantity: '' };
                    return {
                        id: ing.id || ing._id || null,
                        name: ing.name || ing.nama || ing.item || '',
                        quantity: ing.quantity || ing.qty || ing.jumlah || '',
                    };
                });
            }

            // Steps -> array of objects { id?, step_number?, instruction }
            let steps = [];
            if (Array.isArray(r.steps)) {
                steps = r.steps.map((s, idx) => {
                    if (!s) return { id: null, step_number: idx + 1, instruction: '' };
                    if (typeof s === 'string') return { id: null, step_number: idx + 1, instruction: s };
                    return {
                        id: s.id || s._id || null,
                        step_number: s.step_number ?? s.number ?? s.order ?? (s.step_number === 0 ? 0 : idx + 1),
                        instruction: s.instruction || s.step || s.text || s.description || s.langkah || '',
                    };
                });
            }

            return {
                ...r,
                image_url,
                ingredients,
                steps,
            };
        };

        const normalized = normalizeRecipe(recipe);

        // Preserve wrapper shape: return { success, data }
        if (raw && typeof raw === 'object' && 'success' in raw) {
            return {
                ...raw,
                data: normalized,
            };
        }

        return { success: true, data: normalized };
    }

    /**
     * Create new recipe
     * @param {Object} recipeData - Recipe data
     * @returns {Promise}
     */
    async createRecipe(recipeData) {
        return await apiClient.post('/api/v1/recipes', recipeData);
    }

    /**
     * Update existing recipe (full replacement)
     * @param {string} id - Recipe ID
     * @param {Object} recipeData - Complete recipe data (all fields required)
     * @returns {Promise}
     */
    async updateRecipe(id, recipeData) {
        return await apiClient.put(`/api/v1/recipes/${id}`, recipeData);
    }

    /**
     * Partially update recipe (only send fields to update)
     * @param {string} id - Recipe ID
     * @param {Object} partialData - Partial recipe data (only fields to update)
     * @returns {Promise}
     */
    async patchRecipe(id, partialData) {
        return await apiClient.patch(`/api/v1/recipes/${id}`, partialData);
    }

    /**
     * Delete recipe
     * @param {string} id - Recipe ID
     * @returns {Promise}
     */
    async deleteRecipe(id) {
        return await apiClient.delete(`/api/v1/recipes/${id}`);
    }
}

export default new RecipeService();



