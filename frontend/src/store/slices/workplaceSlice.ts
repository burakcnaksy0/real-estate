import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Workplace, WorkplaceCreateRequest, WorkplaceFilterRequest, PageResponse } from '../../types';
import { toast } from 'react-toastify';

// Workplace service'i henüz oluşturmadık, placeholder olarak bırakıyoruz
interface WorkplaceState {
  workplaces: Workplace[];
  currentWorkplace: Workplace | null;
  pagedWorkplaces: PageResponse<Workplace> | null;
  searchResults: PageResponse<Workplace> | null;
  isLoading: boolean;
  error: string | null;
  filters: WorkplaceFilterRequest;
}

const initialState: WorkplaceState = {
  workplaces: [],
  currentWorkplace: null,
  pagedWorkplaces: null,
  searchResults: null,
  isLoading: false,
  error: null,
  filters: {},
};

const workplaceSlice = createSlice({
  name: 'workplaces',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkplace: (state, action) => {
      state.currentWorkplace = action.payload;
    },
    clearCurrentWorkplace: (state) => {
      state.currentWorkplace = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { clearError, setCurrentWorkplace, clearCurrentWorkplace, setFilters, clearFilters } = workplaceSlice.actions;
export default workplaceSlice.reducer;