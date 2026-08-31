import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import offerService from '../services/offerService'

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────

export const fetchOffers = createAsyncThunk(
  'offer/fetchOffers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await offerService.getAllOffers()
      return data.data // { stats, offers }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch offers')
    }
  }
)

export const createOffer = createAsyncThunk(
  'offer/createOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const data = await offerService.createOffer(offerData)
      return data.data // newly created offer object
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create offer')
    }
  }
)

export const updateOffer = createAsyncThunk(
  'offer/updateOffer',
  async ({ id, offerData }, { rejectWithValue }) => {
    try {
      const data = await offerService.updateOffer(id, offerData)
      // API returns updated fields — merge with id
      return { id, ...data.data }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update offer')
    }
  }
)

export const deleteOffer = createAsyncThunk(
  'offer/deleteOffer',
  async (offerId, { rejectWithValue }) => {
    try {
      await offerService.deleteOffer(offerId)
      return offerId
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete offer')
    }
  }
)

export const toggleOfferStatus = createAsyncThunk(
  'offer/toggleOfferStatus',
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1
      const data = await offerService.updateOffer(id, { is_active: newStatus })
      return { id, is_active: newStatus, ...data.data }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to toggle offer status')
    }
  }
)

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const initialState = {
  offers: [],
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
  },
  loading: false,
  actionLoading: false, // for create/update/delete/toggle
  error: null,
  actionError: null,
}

const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    // ── fetchOffers ──────────────────────────────────────────────────────
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOffers.fulfilled, (state, { payload }) => {
        state.loading = false
        state.offers = payload.offers
        state.stats = payload.stats
      })
      .addCase(fetchOffers.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── createOffer ──────────────────────────────────────────────────────
    builder
      .addCase(createOffer.pending, (state) => {
        state.actionLoading = true
        state.actionError = null
      })
      .addCase(createOffer.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        state.offers.push(payload)
        // update stats
        state.stats.total += 1
        if (payload.is_active === 1) state.stats.active += 1
        else state.stats.inactive += 1
      })
      .addCase(createOffer.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.actionError = payload
      })

    // ── updateOffer ──────────────────────────────────────────────────────
    builder
      .addCase(updateOffer.pending, (state) => {
        state.actionLoading = true
        state.actionError = null
      })
      .addCase(updateOffer.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        const index = state.offers.findIndex((o) => o.id === payload.id)
        if (index !== -1) {
          state.offers[index] = { ...state.offers[index], ...payload }
        }
      })
      .addCase(updateOffer.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.actionError = payload
      })

    // ── deleteOffer ──────────────────────────────────────────────────────
    builder
      .addCase(deleteOffer.pending, (state) => {
        state.actionLoading = true
        state.actionError = null
      })
      .addCase(deleteOffer.fulfilled, (state, { payload: id }) => {
        state.actionLoading = false
        const offer = state.offers.find((o) => o.id === id)
        if (offer) {
          state.stats.total -= 1
          if (offer.is_active === 1) state.stats.active -= 1
          else state.stats.inactive -= 1
        }
        state.offers = state.offers.filter((o) => o.id !== id)
      })
      .addCase(deleteOffer.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.actionError = payload
      })

    // ── toggleOfferStatus ────────────────────────────────────────────────
    builder
      .addCase(toggleOfferStatus.pending, (state, { meta }) => {
        // optimistic: mark the specific offer as toggling
        const offer = state.offers.find((o) => o.id === meta.arg.id)
        if (offer) offer._toggling = true
      })
      .addCase(toggleOfferStatus.fulfilled, (state, { payload }) => {
        const index = state.offers.findIndex((o) => o.id === payload.id)
        if (index !== -1) {
          const prev = state.offers[index]
          // update stats
          if (prev.is_active === 1) {
            state.stats.active -= 1
            state.stats.inactive += 1
          } else {
            state.stats.inactive -= 1
            state.stats.active += 1
          }
          state.offers[index] = {
            ...prev,
            ...payload,
            _toggling: false,
          }
        }
      })
      .addCase(toggleOfferStatus.rejected, (state, { meta }) => {
        // revert optimistic flag
        const offer = state.offers.find((o) => o.id === meta.arg.id)
        if (offer) offer._toggling = false
      })
  },
})

export const { clearError } = offerSlice.actions
export default offerSlice.reducer