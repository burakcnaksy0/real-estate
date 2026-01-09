import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RealEstateService } from '../../services/realEstateService';
import { RealEstate, RealEstateCreateRequest, RealEstateFilterRequest, PageResponse } from '../../types';
import { toast } from 'react-toastify';

interface RealEstateState {
  realEstates: RealEstate[];
  currentRealEstate: RealEstate | null;
  pagedRealEstates: PageResponse<RealEstate> | null;
  searchResults: PageResponse<RealEstate> | null;
  isLoading: boolean;
  error: string | null;
  filters: RealEstateFilterRequest;
}

const initialState: RealEstateState = {
  realEstates: [],
  currentRealEstate: null,
  pagedRealEstates: null,
  searchResults: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchRealEstatesAsync = createAsyncThunk(
  'realEstate/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await RealEstateService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Emlak ilanları yüklenirken hata oluştu');
    }
  }
);

export const fetchRealEstatesPagedAsync = createAsyncThunk(
  'realEstate/fetchPaged',
  async (params: { page?: number; size?: number; sort?: string }, { rejectWithValue }) => {
    try {
      return await RealEstateService.getAllPaged(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Emlak ilanları yüklenirken hata oluştu');
    }
  }
);

export const searchRealEstatesAsync = createAsyncThunk(
  'realEstate/search',
  async (params: { filter: RealEstateFilterRequest; page?: number; size?: number; sort?: string }, { rejectWithValue }) => {
    try {
      return await RealEstateService.search(params.filter, {
        page: params.page,
        size: params.size,
        sort: params.sort
      });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Arama yapılırken hata oluştu');
    }
  }
);

export const fetchRealEstateByIdAsync = createAsyncThunk(
  'realEstate/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await RealEstateService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Emlak ilanı yüklenirken hata oluştu');
    }
  }
);

export const createRealEstateAsync = createAsyncThunk(
  'realEstate/create',
  async (realEstateData: RealEstateCreateRequest, { rejectWithValue }) => {
    try {
      const result = await RealEstateService.create(realEstateData);
      toast.success('Emlak ilanı başarıyla oluşturuldu');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Emlak ilanı oluşturulurken hata oluştu');
    }
  }
);

export const updateRealEstateAsync = createAsyncThunk(
  'realEstate/update',
  async (params: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const result = await RealEstateService.update(params.id, params.data);
      toast.success('Emlak ilanı başarıyla güncellendi');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Emlak ilanı güncellenirken hata oluştu');
    }
  }
);

export const deleteRealEstateAsync = createAsyncThunk(
  'realEstate/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await RealEstateService.delete(id);
      toast.success('Emlak ilanı başarıyla silindi');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Emlak ilanı silinirken hata oluştu');
    }
  }
);

const realEstateSlice = createSlice({
  name: 'realEstate',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRealEstate: (state, action: PayloadAction<RealEstate | null>) => {
      state.currentRealEstate = action.payload;
    },
    clearCurrentRealEstate: (state) => {
      state.currentRealEstate = null;
    },
    setFilters: (state, action: PayloadAction<RealEstateFilterRequest>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all real estates
      .addCase(fetchRealEstatesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRealEstatesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.realEstates = action.payload;
        state.error = null;
      })
      .addCase(fetchRealEstatesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch paged real estates
      .addCase(fetchRealEstatesPagedAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRealEstatesPagedAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagedRealEstates = action.payload;
        state.error = null;
      })
      .addCase(fetchRealEstatesPagedAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search real estates
      .addCase(searchRealEstatesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRealEstatesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchRealEstatesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch real estate by ID
      .addCase(fetchRealEstateByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRealEstateByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRealEstate = action.payload;
        state.error = null;
      })
      .addCase(fetchRealEstateByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create real estate
      .addCase(createRealEstateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRealEstateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.realEstates.push(action.payload);
        state.error = null;
      })
      .addCase(createRealEstateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update real estate
      .addCase(updateRealEstateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRealEstateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.realEstates.findIndex(re => re.id === action.payload.id);
        if (index !== -1) {
          state.realEstates[index] = action.payload;
        }
        if (state.currentRealEstate?.id === action.payload.id) {
          state.currentRealEstate = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRealEstateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete real estate
      .addCase(deleteRealEstateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRealEstateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.realEstates = state.realEstates.filter(re => re.id !== action.payload);
        if (state.currentRealEstate?.id === action.payload) {
          state.currentRealEstate = null;
        }
        state.error = null;
      })
      .addCase(deleteRealEstateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setCurrentRealEstate, 
  clearCurrentRealEstate, 
  setFilters, 
  clearFilters, 
  clearSearchResults 
} = realEstateSlice.actions;

export default realEstateSlice.reducer;