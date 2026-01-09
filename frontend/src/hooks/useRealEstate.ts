import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchRealEstatesAsync,
  fetchRealEstatesPagedAsync,
  searchRealEstatesAsync,
  fetchRealEstateByIdAsync,
  createRealEstateAsync,
  updateRealEstateAsync,
  deleteRealEstateAsync,
  setFilters,
  clearFilters,
  clearSearchResults,
  setCurrentRealEstate,
  clearCurrentRealEstate,
} from '../store/slices/realEstateSlice';
import { RealEstateCreateRequest, RealEstateFilterRequest } from '../types';

export const useRealEstate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    realEstates,
    currentRealEstate,
    pagedRealEstates,
    searchResults,
    isLoading,
    error,
    filters,
  } = useSelector((state: RootState) => state.realEstate);

  // Fetch operations
  const fetchAll = useCallback(() => {
    return dispatch(fetchRealEstatesAsync());
  }, [dispatch]);

  const fetchPaged = useCallback(
    (params: { page?: number; size?: number; sort?: string }) => {
      return dispatch(fetchRealEstatesPagedAsync(params));
    },
    [dispatch]
  );

  const search = useCallback(
    (filter: RealEstateFilterRequest, params?: { page?: number; size?: number; sort?: string }) => {
      return dispatch(searchRealEstatesAsync({ filter, ...params }));
    },
    [dispatch]
  );

  const fetchById = useCallback(
    (id: number) => {
      return dispatch(fetchRealEstateByIdAsync(id));
    },
    [dispatch]
  );

  // CRUD operations
  const create = useCallback(
    (data: RealEstateCreateRequest) => {
      return dispatch(createRealEstateAsync(data));
    },
    [dispatch]
  );

  const update = useCallback(
    (id: number, data: any) => {
      return dispatch(updateRealEstateAsync({ id, data }));
    },
    [dispatch]
  );

  const remove = useCallback(
    (id: number) => {
      return dispatch(deleteRealEstateAsync(id));
    },
    [dispatch]
  );

  // Filter operations
  const updateFilters = useCallback(
    (newFilters: RealEstateFilterRequest) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // UI operations
  const setCurrent = useCallback(
    (realEstate: any) => {
      dispatch(setCurrentRealEstate(realEstate));
    },
    [dispatch]
  );

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentRealEstate());
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // Utility functions
  const getFilteredResults = useCallback(() => {
    return searchResults || pagedRealEstates;
  }, [searchResults, pagedRealEstates]);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    // State
    realEstates,
    currentRealEstate,
    pagedRealEstates,
    searchResults,
    isLoading,
    error,
    filters,

    // Actions
    fetchAll,
    fetchPaged,
    search,
    fetchById,
    create,
    update,
    remove,

    // Filter actions
    updateFilters,
    resetFilters,

    // UI actions
    setCurrent,
    clearCurrent,
    clearSearch,

    // Utilities
    getFilteredResults,
    hasActiveFilters,
  };
};