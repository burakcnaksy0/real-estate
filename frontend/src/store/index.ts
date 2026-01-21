import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import categorySlice from './slices/categorySlice';
import realEstateSlice from './slices/realEstateSlice';
import vehicleSlice from './slices/vehicleSlice';
import landSlice from './slices/landSlice';
import workplaceSlice from './slices/workplaceSlice';
import uiSlice from './slices/uiSlice';
import comparisonSlice from './slices/comparisonSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    categories: categorySlice,
    realEstate: realEstateSlice,
    vehicles: vehicleSlice,
    lands: landSlice,
    workplaces: workplaceSlice,
    ui: uiSlice,
    comparison: comparisonSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;