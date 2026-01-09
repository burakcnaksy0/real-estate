import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CategoryService } from '../../services/categoryService';
import { Category, PageResponse } from '../../types';
import { toast } from 'react-toastify';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  pagedCategories: PageResponse<Category> | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  pagedCategories: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCategoriesAsync = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await CategoryService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kategoriler yüklenirken hata oluştu');
    }
  }
);

export const fetchCategoriesPagedAsync = createAsyncThunk(
  'categories/fetchPaged',
  async (params: { page?: number; size?: number; sort?: string }, { rejectWithValue }) => {
    try {
      return await CategoryService.getAllPaged(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kategoriler yüklenirken hata oluştu');
    }
  }
);

export const fetchCategoryByIdAsync = createAsyncThunk(
  'categories/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await CategoryService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kategori yüklenirken hata oluştu');
    }
  }
);

export const createCategoryAsync = createAsyncThunk(
  'categories/create',
  async (categoryData: { name: string; slug: string }, { rejectWithValue }) => {
    try {
      const result = await CategoryService.create(categoryData);
      toast.success('Kategori başarıyla oluşturuldu');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kategori oluşturulurken hata oluştu');
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  'categories/update',
  async (params: { id: number; data: { name?: string; slug?: string; active?: boolean } }, { rejectWithValue }) => {
    try {
      const result = await CategoryService.update(params.id, params.data);
      toast.success('Kategori başarıyla güncellendi');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kategori güncellenirken hata oluştu');
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await CategoryService.delete(id);
      toast.success('Kategori başarıyla silindi');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kategori silinirken hata oluştu');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch paged categories
      .addCase(fetchCategoriesPagedAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesPagedAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagedCategories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriesPagedAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch category by ID
      .addCase(fetchCategoryByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create category
      .addCase(createCategoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update category
      .addCase(updateCategoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCategoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete category
      .addCase(deleteCategoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        if (state.currentCategory?.id === action.payload) {
          state.currentCategory = null;
        }
        state.error = null;
      })
      .addCase(deleteCategoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentCategory, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;