// App Constants
export const APP_NAME = 'Recomm'
export const APP_VERSION = '1.0.0'

// API Constants
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const API_TIMEOUT = 10000

// Auth Constants
export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'
export const AUTH_KEY = 'isAuthenticated'
export const LANGUAGE_KEY = 'language'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Order Status
export const ORDER_STATUS = {
  NEW: 'new',
  ACCEPTED: 'accepted',
  PACKED: 'packed',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  new: 'New',
  accepted: 'Accepted',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS = {
  new: 'warning',
  accepted: 'info',
  packed: 'primary',
  out_for_delivery: 'secondary',
  delivered: 'success',
  cancelled: 'danger',
}

// Product Status
export const PRODUCT_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
}

export const PRODUCT_STATUS_LABELS = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
}

export const PRODUCT_STATUS_COLORS = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
}

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Dairy',
  'Grains',
  'Bakery',
  'Beverages',
  'Snacks',
  'Personal Care',
  'Household',
  'Fruits & Vegetables',
  'Meat & Fish',
  'Frozen Foods',
  'Condiments',
  'Baby Products',
  'Pet Supplies',
  'Stationery',
  'Others',
]

// Product Units
export const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (g)' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'packet', label: 'Packet' },
  { value: 'piece', label: 'Piece' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'box', label: 'Box' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' },
  { value: 'bag', label: 'Bag' },
  { value: 'bundle', label: 'Bundle' },
]

// Offer Types
export const OFFER_TYPES = [
  { value: 'flat', label: 'Flat Discount (₹)' },
  { value: 'percentage', label: 'Percentage Discount (%)' },
  { value: 'buy2get1', label: 'Buy 2 Get 1 Free' },
  { value: 'festival', label: 'Festival Offer' },
  { value: 'combo', label: 'Combo Offer' },
]

// Delivery Radius Options
export const DELIVERY_RADIUS_OPTIONS = [
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
]

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'online', label: 'Online Payment' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
]

// Report Period
export const REPORT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
}

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
]

// Low Stock Threshold
export const LOW_STOCK_THRESHOLD = 10

// Theme Colors
export const THEME_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  dark: '#1f2937',
  light: '#f9fafb',
  gray: '#6b7280',
}

// Chart Colors
export const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
]

// Date Formats
export const DATE_FORMAT = 'DD/MM/YYYY'
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm'
export const TIME_FORMAT = 'HH:mm'

// Validation Rules
export const VALIDATION = {
  MOBILE_LENGTH: 10,
  OTP_LENGTH: 6,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
}

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  STOCK: 'stock',
  CUSTOMER: 'customer',
  SYSTEM: 'system',
}

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
]

// Helper Functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const getStockStatus = (stock) => {
  if (stock === 0) return PRODUCT_STATUS.OUT_OF_STOCK
  if (stock <= LOW_STOCK_THRESHOLD) return PRODUCT_STATUS.LOW_STOCK
  return PRODUCT_STATUS.IN_STOCK
}

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}-${timestamp}`
}

export const calculateDiscount = (mrp, sellingPrice) => {
  if (mrp <= 0) return 0
  return Math.round(((mrp - sellingPrice) / mrp) * 100)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const validateMobile = (mobile) => {
  const regex = /^[6-9]\d{9}$/
  return regex.test(mobile)
}

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validateGST = (gst) => {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return regex.test(gst)
}

export const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export const sortByDate = (arr, key = 'createdAt', order = 'desc') => {
  return [...arr].sort((a, b) => {
    const dateA = new Date(a[key])
    const dateB = new Date(b[key])
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

export const groupBy = (arr, key) => {
  return arr.reduce((groups, item) => {
    const group = item[key]
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {})
}

export default {
  APP_NAME,
  APP_VERSION,
  API_URL,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_COLORS,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  OFFER_TYPES,
  DELIVERY_RADIUS_OPTIONS,
  PAYMENT_METHODS,
  REPORT_PERIODS,
  LANGUAGES,
  THEME_COLORS,
  CHART_COLORS,
  VALIDATION,
  LOW_STOCK_THRESHOLD,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  getStockStatus,
  truncateText,
  generateOrderNumber,
  calculateDiscount,
  debounce,
  validateMobile,
  validateEmail,
  validateGST,
  getInitials,
  getTimeAgo,
  sortByDate,
  groupBy,
}