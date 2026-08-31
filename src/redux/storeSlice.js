// src/redux/storeSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import storeService from '../services/storeService'

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────

/**
 * fetchProfile
 * Used by: MyStore page (on mount) + Settings page (on mount)
 * Returns: full profile object including is_holiday, opening_time, closing_time
 */
export const fetchProfile = createAsyncThunk(
  'store/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const response = await storeService.getProfile()
      // response = { status: true, code: 200, message: "...", data: {...} }
      return response.data // Return just the data object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || error?.data?.message || 'Failed to fetch profile'
      )
    }
  }
)

/**
 * updateProfile
 * Used by: MyStore page (save store info) + Settings page (timings & holiday)
 * Accepts full payload including optional is_holiday and store_photo (File)
 */
export const updateProfile = createAsyncThunk(
  'store/updateProfile',
  async (payload, thunkAPI) => {
    try {
      const response = await storeService.updateProfile(payload)
      // response = { status: true, code: 200, message: "...", data: {...} }
      return response.data // Return just the data object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || error?.data?.message || 'Failed to update profile'
      )
    }
  }
)
// ─────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────
const initialState = {
  profile: null,   // raw API profile — { ..., is_holiday: 0|1 }
  loading: false,  // true while fetchProfile is in flight
  saving: false,  // true while updateProfile is in flight
  error: null,   // fetchProfile error message
  saveError: null,   // updateProfile error message
}

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    // Clear both fetch and save errors
    clearStoreError: (state) => {
      state.error = null
      state.saveError = null
    },

    /**
     * Optimistic holiday toggle
     * Settings page calls this BEFORE the API call for instant UI feedback.
     * If the API call fails, storeSlice's rejected case reverts it.
     */
    toggleHolidayOptimistic: (state) => {
      if (state.profile) {
        state.profile.is_holiday = state.profile.is_holiday === 1 ? 0 : 1
      }
    },
  },

  extraReducers: (builder) => {

    // ── fetchProfile ──────────────────────────────────────────
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload   // full profile from API
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ── updateProfile ─────────────────────────────────────────
    builder
      .addCase(updateProfile.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.saving = false
        // Merge API response back into profile
        // This ensures is_holiday, opening_time, etc. stay in sync
        if (action.payload) {
          state.profile = { ...state.profile, ...action.payload }
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload

        // Revert the optimistic holiday toggle if the API call failed
        if (state.profile) {
          state.profile.is_holiday = state.profile.is_holiday === 1 ? 0 : 1
        }
      })
  },
})

export const { clearStoreError, toggleHolidayOptimistic } = storeSlice.actions
export default storeSlice.reducer