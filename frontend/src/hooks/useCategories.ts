import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchCategoriesAsync,
  fetchCategoriesPagedAsync,
  fetchCategoryByIdAsync,
  createCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
  setCurrentCategory,
  clearCurrentCategory,
} from '../store/slices/categorySlice';

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    categories,
    currentCategory,
    pagedCategories,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.categories);

  // Fetch operations
  const fetchAll = useCallback(() => {
    return dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const fetchPaged = useCallback(
    (params: { page?: number; size?: number; sort?: string }) => {
      return dispatch(fetchCategoriesPagedAsync(params));
    },
    [dispatch]
  );

  const fetchById = useCallback(
    (id: number) => {
      return dispatch(fetchCategoryByIdAsync(id));
    },
    [dispatch]
  );

  // CRUD operations
  const create = useCallback(
    (data: { name: string; slug: string }) => {
      return dispatch(createCategoryAsync(data));
    },
    [dispatch]
  );

  const update = useCallback(
    (id: number, data: { name?: string; slug?: string; active?: boolean }) => {
      return dispatch(updateCategoryAsync({ id, data }));
    },
    [dispatch]
  );

  const remove = useCallback(
    (id: number) => {
      return dispatch(deleteCategoryAsync(id));
    },
    [dispatch]
  );

  // UI operations
  const setCurrent = useCallback(
    (category: any) => {
      dispatch(setCurrentCategory(category));
    },
    [dispatch]
  );

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentCategory());
  }, [dispatch]);

  // Utility functions
  const getActiveCategories = useCallback(() => {
    return categories.filter(category => category.active);
  }, [categories]);

  const getCategoryBySlug = useCallback(
    (slug: string) => {
      return categories.find(category => category.slug === slug);
    },
    [categories]
  );

  const getCategoryOptions = useCallback(() => {
    return getActiveCategories().map(category => ({
      value: category.slug,
      label: category.name,
    }));
  }, [getActiveCategories]);

  // Auto-fetch categories on mount if not loaded
  useEffect(() => {
    if (categories.length === 0 && !isLoading) {
      fetchAll();
    }
  }, [categories.length, isLoading, fetchAll]);

  return {
    // State
    categories,
    currentCategory,
    pagedCategories,
    isLoading,
    error,

    // Actions
    fetchAll,
    fetchPaged,
    fetchById,
    create,
    update,
    remove,

    // UI actions
    setCurrent,
    clearCurrent,

    // Utilities
    getActiveCategories,
    getCategoryBySlug,
    getCategoryOptions,
  };
};