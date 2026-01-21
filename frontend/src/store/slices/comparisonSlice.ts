import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ComparisonState {
    selectedListings: number[];
    category: string | null;
    maxSelections: number;
}

const initialState: ComparisonState = {
    selectedListings: [],
    category: null,
    maxSelections: 3,
};

const comparisonSlice = createSlice({
    name: 'comparison',
    initialState,
    reducers: {
        addListing: (state, action: PayloadAction<{ id: number; category: string }>) => {
            const { id, category } = action.payload;

            // Check if category matches or is first selection
            if (state.category === null) {
                state.category = category;
            } else if (state.category !== category) {
                // Don't add if category doesn't match
                return;
            }

            // Check max selections
            if (state.selectedListings.length >= state.maxSelections) {
                return;
            }

            // Add if not already selected
            if (!state.selectedListings.includes(id)) {
                state.selectedListings.push(id);
            }
        },

        removeListing: (state, action: PayloadAction<number>) => {
            state.selectedListings = state.selectedListings.filter(id => id !== action.payload);

            // Reset category if no listings selected
            if (state.selectedListings.length === 0) {
                state.category = null;
            }
        },

        clearComparison: (state) => {
            state.selectedListings = [];
            state.category = null;
        },

        toggleListing: (state, action: PayloadAction<{ id: number; category: string }>) => {
            const { id, category } = action.payload;

            if (state.selectedListings.includes(id)) {
                // Remove if already selected
                state.selectedListings = state.selectedListings.filter(listingId => listingId !== id);

                // Reset category if no listings selected
                if (state.selectedListings.length === 0) {
                    state.category = null;
                }
            } else {
                // Add if not selected (using addListing logic)
                if (state.category === null) {
                    state.category = category;
                } else if (state.category !== category) {
                    return;
                }

                if (state.selectedListings.length < state.maxSelections) {
                    state.selectedListings.push(id);
                }
            }
        },
    },
});

export const { addListing, removeListing, clearComparison, toggleListing } = comparisonSlice.actions;
export default comparisonSlice.reducer;
