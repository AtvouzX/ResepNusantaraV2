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
        return await apiClient.get(`/api/v1/recipes/${id}`);
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



