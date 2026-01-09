import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Land, LandCreateRequest, LandFilterRequest, PageResponse } from '../../types';
import { toast } from 'react-toastify';

// Land service'i henüz oluşturmadık, placeholder olarak bırakıyoruz
interface LandState {
  lands: Land[];
  currentLand: Land | null;
  pagedLands: PageResponse<Land> | null;
  searchResults: PageResponse<Land> | null;
  isLoading: boolean;
  error: string | null;
  filters: LandFilterRequest;
}

const initialState: LandState = {
  lands: [],
  currentLand: null,
  pagedLands: null,
  searchResults: null,
  isLoading: false,
  error: null,
  filters: {},
};

const landSlice = createSlice({
  name: 'lands',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLand: (state, action) => {
      state.currentLand = action.payload;
    },
    clearCurrentLand: (state) => {
      state.currentLand = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { clearError, setCurrentLand, clearCurrentLand, setFilters, clearFilters } = landSlice.actions;
export default landSlice.reducer;