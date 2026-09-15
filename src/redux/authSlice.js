import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const BASE = 'https://admin.recomm.in/api/'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getToken = () => localStorage.getItem('token')
const saveSession = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────

/** LOGIN — Step 1: send OTP */
export const loginSendOtp = createAsyncThunk(
  'auth/loginSendOtp',
  async (mobile, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/login_send_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (!data.status) return rejectWithValue(data.message || 'Failed to send OTP')
      return { maskedMobile: data.masked_mobile }
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

/** LOGIN — Step 2: verify OTP */
export const loginVerifyOtp = createAsyncThunk(
  'auth/loginVerifyOtp',
  async ({ mobile, otp }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/verify_login_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      })
      const data = await res.json()
      if (!data.status) return rejectWithValue(data.message || 'Invalid OTP')
      saveSession(data.data.token, data.data.user)
      return { token: data.data.token, user: data.data.user }
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

/** REGISTER — Step 1: send OTP */
export const registerSendOtp = createAsyncThunk(
  'auth/registerSendOtp',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/register_send_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!data.status) return rejectWithValue(data.message || 'Failed to send OTP')
      return true
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

/** REGISTER — Step 2: verify OTP */
export const registerVerifyOtp = createAsyncThunk(
  'auth/registerVerifyOtp',
  async ({ mobile, otp }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/verify_register_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      })
      const data = await res.json()
      if (!data.status) return rejectWithValue(data.message || 'Invalid OTP')
      saveSession(data.data.token, data.data.user)
      return { token: data.data.token, user: data.data.user }
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

/** Check auth on app boot — reads localStorage only, never blocks OTP flows */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken()
      const raw = localStorage.getItem('user')
      if (!token || !raw) return rejectWithValue('No session')
      return { token, user: JSON.parse(raw) }
    } catch {
      return rejectWithValue('Invalid session')
    }
  }
)

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,

    // authChecked = true once checkAuth has finished (fulfilled OR rejected).
    // AppRoutes shows FullPageLoader only while authChecked is false.
    // This is SEPARATE from `loading` so OTP API calls never trigger the loader.
    authChecked: false,

    // loading = true only during OTP API calls (shown as button spinner in forms).
    loading: false,

    error: null,
    maskedMobile: null,
    otpSent: false, // Register uses this to auto-advance to step 2
  },

  reducers: {
    logout(state) {
      clearSession()
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.maskedMobile = null
      state.otpSent = false
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
    resetOtpState(state) {
      state.maskedMobile = null
      state.otpSent = false
      state.error = null
    },
    updateUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },

  extraReducers: (builder) => {
    // ── checkAuth — only this one gates the full page loader ───────────────
    builder
      .addCase(checkAuth.pending, (state) => {
        state.authChecked = false
      })
      .addCase(checkAuth.fulfilled, (state, { payload }) => {
        state.authChecked = true
        state.isAuthenticated = true
        state.token = payload.token
        state.user = payload.user
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authChecked = true
        state.isAuthenticated = false
      })

    // ── loginSendOtp ───────────────────────────────────────────────────────
    builder
      .addCase(loginSendOtp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginSendOtp.fulfilled, (state, { payload }) => {
        state.loading = false
        state.maskedMobile = payload.maskedMobile
      })
      .addCase(loginSendOtp.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── loginVerifyOtp ─────────────────────────────────────────────────────
    builder
      .addCase(loginVerifyOtp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginVerifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = payload.token
        state.user = payload.user
      })
      .addCase(loginVerifyOtp.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── registerSendOtp ────────────────────────────────────────────────────
    builder
      .addCase(registerSendOtp.pending, (state) => {
        state.loading = true
        state.error = null
        state.otpSent = false
      })
      .addCase(registerSendOtp.fulfilled, (state) => {
        state.loading = false
        state.otpSent = true
      })
      .addCase(registerSendOtp.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
        state.otpSent = false
      })

    // ── registerVerifyOtp ──────────────────────────────────────────────────
    builder
      .addCase(registerVerifyOtp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerVerifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = payload.token
        state.user = payload.user
        state.otpSent = false
      })
      .addCase(registerVerifyOtp.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  },
})

export const { logout, clearError, resetOtpState, updateUser } = authSlice.actions
export default authSlice.reducer