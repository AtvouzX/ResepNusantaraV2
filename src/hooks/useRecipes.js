import { useState, useEffect, useCallback } from 'react';
import recipeService from '../services/recipeService';

// Simple in-memory cache for queries. Keys are JSON strings of params.
const listCache = new Map(); // key -> { ts, data, pagination }
const recipeCache = new Map(); // id -> { ts, data }
const DEFAULT_CACHE_TTL = 60 * 1000; // 60s

/**
 * Custom hook for fetching recipes
 * @param {Object} params - Query parameters
 * @returns {Object} - { recipes, loading, error, pagination, refetch }
 */
export function useRecipes(params = {}) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    const paramsString = JSON.stringify(params);

    const fetchRecipes = useCallback(async (force = false) => {
        try {
            setLoading(true);
            setError(null);

            // derive cache values from paramsString (keeps deps stable)
            const parsedParams = paramsString ? JSON.parse(paramsString) : {};
            const cacheTimeLocal = parsedParams.__cacheTime ?? DEFAULT_CACHE_TTL;
            const paramsForKeyLocal = { ...parsedParams };
            delete paramsForKeyLocal.__cacheTime;
            const cacheKeyLocal = JSON.stringify(paramsForKeyLocal);

            // Check cache
            if (!force && listCache.has(cacheKeyLocal)) {
                const entry = listCache.get(cacheKeyLocal);
                if (Date.now() - entry.ts <= cacheTimeLocal) {
                    setRecipes(entry.data || []);
                    setPagination(entry.pagination || null);
                    setLoading(false);
                    return entry;
                }
            }

            // Not cached or stale -> fetch
            const response = await recipeService.getRecipes(paramsForKeyLocal);

            if (response && response.success) {
                setRecipes(response.data || []);
                setPagination(response.pagination || null);
                listCache.set(cacheKeyLocal, { ts: Date.now(), data: response.data || [], pagination: response.pagination || null });
            } else if (response && !response.success) {
                setError(response.message || 'Failed to fetch recipes');
            } else {
                // If API returns raw data (not wrapped), try to use it
                setRecipes(response || []);
                setPagination(null);
                listCache.set(cacheKeyLocal, { ts: Date.now(), data: response || [], pagination: null });
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching recipes');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    }, [paramsString]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    return {
        recipes,
        loading,
        error,
        pagination,
        refetch: (force = false) => fetchRecipes(force),
    };
}

/**
 * Custom hook for fetching a single recipe
 * @param {string} id - Recipe ID
 * @returns {Object} - { recipe, loading, error, refetch }
 */
export function useRecipe(id) {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchRecipe = useCallback(async (force = false) => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (!force && recipeCache.has(id)) {
                const entry = recipeCache.get(id);
                if (Date.now() - entry.ts <= DEFAULT_CACHE_TTL) {
                    setRecipe(entry.data);
                    setLoading(false);
                    return entry;
                }
            }

            const response = await recipeService.getRecipeById(id);

            if (response && response.success) {
                setRecipe(response.data);
                recipeCache.set(id, { ts: Date.now(), data: response.data });
            } else if (response && !response.success) {
                setError(response.message || 'Failed to fetch recipe');
            } else {
                setRecipe(response || null);
                recipeCache.set(id, { ts: Date.now(), data: response || null });
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching recipe');
            setRecipe(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRecipe();
    }, [fetchRecipe]);

    return {
        recipe,
        loading,
        error,
        refetch: fetchRecipe,
    };
}
