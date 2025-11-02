import { apiClient } from '../config/api';
class FavoriteService {
    /**
     * Get all favorite recipes by user identifier
     * @param {string} userIdentifier - User identifier
     * @returns {Promise}
     */
    async getFavorites(userIdentifier) {
        return await apiClient.get('/api/v1/favorites', {
            params: { user_identifier: userIdentifier }
        });
    }

    /**
     * Toggle favorite (add if not exists, remove if exists)
     * @param {Object} data - Favorite data
     * @param {string} data.recipe_id - Recipe ID
     * @param {string} data.user_identifier - User identifier
     * @returns {Promise}
     */
    async toggleFavorite(data) {
        return await apiClient.post('/api/v1/favorites/toggle', data);
    }
}

export default new FavoriteService();
