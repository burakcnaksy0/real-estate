import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { VehicleService } from '../../services/vehicleService';
import { Vehicle, VehicleCreateRequest, VehicleFilterRequest, PageResponse } from '../../types';
import { toast } from 'react-toastify';

interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  pagedVehicles: PageResponse<Vehicle> | null;
  searchResults: PageResponse<Vehicle> | null;
  isLoading: boolean;
  error: string | null;
  filters: VehicleFilterRequest;
}

const initialState: VehicleState = {
  vehicles: [],
  currentVehicle: null,
  pagedVehicles: null,
  searchResults: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchVehiclesAsync = createAsyncThunk(
  'vehicles/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await VehicleService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Araç ilanları yüklenirken hata oluştu');
    }
  }
);

export const fetchVehiclesPagedAsync = createAsyncThunk(
  'vehicles/fetchPaged',
  async (params: { page?: number; size?: number; sort?: string }, { rejectWithValue }) => {
    try {
      return await VehicleService.getAllPaged(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Araç ilanları yüklenirken hata oluştu');
    }
  }
);

export const searchVehiclesAsync = createAsyncThunk(
  'vehicles/search',
  async (params: { filter: VehicleFilterRequest; page?: number; size?: number; sort?: string }, { rejectWithValue }) => {
    try {
      return await VehicleService.search(params.filter, {
        page: params.page,
        size: params.size,
        sort: params.sort
      });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Arama yapılırken hata oluştu');
    }
  }
);

export const fetchVehicleByIdAsync = createAsyncThunk(
  'vehicles/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await VehicleService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Araç ilanı yüklenirken hata oluştu');
    }
  }
);

export const createVehicleAsync = createAsyncThunk(
  'vehicles/create',
  async (vehicleData: VehicleCreateRequest, { rejectWithValue }) => {
    try {
      const result = await VehicleService.create(vehicleData);
      toast.success('Araç ilanı başarıyla oluşturuldu');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Araç ilanı oluşturulurken hata oluştu');
    }
  }
);

export const updateVehicleAsync = createAsyncThunk(
  'vehicles/update',
  async (params: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const result = await VehicleService.update(params.id, params.data);
      toast.success('Araç ilanı başarıyla güncellendi');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Araç ilanı güncellenirken hata oluştu');
    }
  }
);

export const deleteVehicleAsync = createAsyncThunk(
  'vehicles/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await VehicleService.delete(id);
      toast.success('Araç ilanı başarıyla silindi');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Araç ilanı silinirken hata oluştu');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.currentVehicle = action.payload;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    },
    setFilters: (state, action: PayloadAction<VehicleFilterRequest>) => {
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
      // Fetch all vehicles
      .addCase(fetchVehiclesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = action.payload;
        state.error = null;
      })
      .addCase(fetchVehiclesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch paged vehicles
      .addCase(fetchVehiclesPagedAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesPagedAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagedVehicles = action.payload;
        state.error = null;
      })
      .addCase(fetchVehiclesPagedAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search vehicles
      .addCase(searchVehiclesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchVehiclesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchVehiclesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Other cases similar to realEstateSlice...
      .addCase(fetchVehicleByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVehicle = action.payload;
        state.error = null;
      })
      .addCase(createVehicleAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles.push(action.payload);
        state.error = null;
      })
      .addCase(deleteVehicleAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
        if (state.currentVehicle?.id === action.payload) {
          state.currentVehicle = null;
        }
        state.error = null;
      });
  },
});

export const { 
  clearError, 
  setCurrentVehicle, 
  clearCurrentVehicle, 
  setFilters, 
  clearFilters, 
  clearSearchResults 
} = vehicleSlice.actions;

export default vehicleSlice.reducer;