// src/services/authService.js
import { authAPI } from './api'
import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'http://localhost/kaushik_php/ci_project/recomm/api/',
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

const authService = {
  loginSendOtp: (mobile) => authAPI.loginSendOtp(mobile),
  loginVerifyOtp: (mobile, otp) => authAPI.loginVerifyOtp(mobile, otp),
  registerSendOtp: (data) => authAPI.registerSendOtp(data),
  registerVerifyOtp: (mobile, otp) => authAPI.registerVerifyOtp(mobile, otp),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

export default authService