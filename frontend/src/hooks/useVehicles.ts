import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchVehiclesAsync,
  fetchVehiclesPagedAsync,
  searchVehiclesAsync,
  fetchVehicleByIdAsync,
  createVehicleAsync,
  updateVehicleAsync,
  deleteVehicleAsync,
  setFilters,
  clearFilters,
  clearSearchResults,
  setCurrentVehicle,
  clearCurrentVehicle,
} from '../store/slices/vehicleSlice';
import { VehicleCreateRequest, VehicleFilterRequest } from '../types';

export const useVehicles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    vehicles,
    currentVehicle,
    pagedVehicles,
    searchResults,
    isLoading,
    error,
    filters,
  } = useSelector((state: RootState) => state.vehicles);

  // Fetch operations
  const fetchAll = useCallback(() => {
    return dispatch(fetchVehiclesAsync());
  }, [dispatch]);

  const fetchPaged = useCallback(
    (params: { page?: number; size?: number; sort?: string }) => {
      return dispatch(fetchVehiclesPagedAsync(params));
    },
    [dispatch]
  );

  const search = useCallback(
    (filter: VehicleFilterRequest, params?: { page?: number; size?: number; sort?: string }) => {
      return dispatch(searchVehiclesAsync({ filter, ...params }));
    },
    [dispatch]
  );

  const fetchById = useCallback(
    (id: number) => {
      return dispatch(fetchVehicleByIdAsync(id));
    },
    [dispatch]
  );

  // CRUD operations
  const create = useCallback(
    (data: VehicleCreateRequest) => {
      return dispatch(createVehicleAsync(data));
    },
    [dispatch]
  );

  const update = useCallback(
    (id: number, data: any) => {
      return dispatch(updateVehicleAsync({ id, data }));
    },
    [dispatch]
  );

  const remove = useCallback(
    (id: number) => {
      return dispatch(deleteVehicleAsync(id));
    },
    [dispatch]
  );

  // Filter operations
  const updateFilters = useCallback(
    (newFilters: VehicleFilterRequest) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // UI operations
  const setCurrent = useCallback(
    (vehicle: any) => {
      dispatch(setCurrentVehicle(vehicle));
    },
    [dispatch]
  );

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentVehicle());
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // Utility functions
  const getFilteredResults = useCallback(() => {
    return searchResults || pagedVehicles;
  }, [searchResults, pagedVehicles]);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    // State
    vehicles,
    currentVehicle,
    pagedVehicles,
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