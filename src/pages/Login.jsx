import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  loginSendOtp,
  loginVerifyOtp,
  clearError,
  resetOtpState,
} from '../redux/authSlice'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import { FaMobileAlt, FaShieldAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa'
import logo from '../assets/logo.png'

const Login = () => {
  const [step, setStep] = useState(1)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(0)
  const [mobileError, setMobileError] = useState('')
  const [tokenLoading, setTokenLoading] = useState(false)

  const otpRefs = useRef([])
  const mobileRef = useRef('')

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { loading, error, maskedMobile } = useSelector((state) => state.auth)
  const { t } = useLanguage()

  // Check for token and user in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const urlToken = urlParams.get('token')
    const urlUser = urlParams.get('user')

    if (urlToken && urlUser) {
      handleTokenLogin(urlToken, urlUser)
    }
  }, [location.search])

  // Handle token-based login from URL
  const handleTokenLogin = async (token, userParam) => {
    try {
      setTokenLoading(true)

      // Decode the user parameter (URL encoded JSON)
      const decodedUser = JSON.parse(decodeURIComponent(userParam))

      // Validate required user fields
      if (!decodedUser.id || !decodedUser.email) {
        throw new Error('Invalid user data')
      }

      // Store token and user in localStorage (matching your existing structure)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({
        id: decodedUser.id.toString(),
        name: decodedUser.name || '',
        email: decodedUser.email,
        mobile: decodedUser.mobile || '',
        role: decodedUser.role || 'vendor',
        isActive: '1',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }))

      // Update Redux auth state by dispatching a manual login success
      dispatch({
        type: 'auth/loginVerifyOtp/fulfilled',
        payload: {
          token: token,
          user: {
            id: decodedUser.id.toString(),
            name: decodedUser.name || '',
            email: decodedUser.email,
            mobile: decodedUser.mobile || '',
            role: decodedUser.role || 'vendor',
            isActive: '1'
          }
        }
      })

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)

      // Navigate to dashboard
      navigate('/dashboard', { replace: true })

    } catch (error) {
      console.error('Token login error:', error)
      // Clear any invalid data
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Show error (you can customize this message)
      dispatch({
        type: 'auth/loginVerifyOtp/rejected',
        payload: 'Invalid login link. Please try logging in manually.'
      })
    } finally {
      setTokenLoading(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetOtpState())
    }
  }, [dispatch])

  // Mobile validation
  const validateMobile = (value) => {
    if (!value) return 'Mobile number is required'
    if (value.length !== 10) return 'Mobile number must be 10 digits'
    if (!/^[6-9]/.test(value)) return 'Please enter a valid Indian mobile number'
    return ''
  }

  // Handle mobile input
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobile(value)
    mobileRef.current = value

    if (value) {
      setMobileError(validateMobile(value))
    } else {
      setMobileError('')
    }
  }

  // Handle OTP input with auto-focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)

    if (pastedData.length === 6) {
      otpRefs.current[5]?.focus()
    } else {
      otpRefs.current[pastedData.length]?.focus()
    }
  }

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()

    const error = validateMobile(mobile)
    if (error) {
      setMobileError(error)
      return
    }

    try {
      mobileRef.current = mobile
      const result = await dispatch(loginSendOtp(mobile))

      if (loginSendOtp.fulfilled.match(result)) {
        setStep(2)
        setTimer(30)
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      }
    } catch (error) {
      console.error('Error in handleSendOtp:', error)
    }
  }

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    const otpValue = otp.join('')
    const mobileToVerify = mobileRef.current

    if (otpValue.length !== 6) return
    if (!mobileToVerify) return

    const result = await dispatch(
      loginVerifyOtp({ mobile: mobileToVerify, otp: otpValue })
    )

    if (loginVerifyOtp.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    const mobileToResend = mobileRef.current || mobile
    if (!mobileToResend) return

    await dispatch(loginSendOtp(mobileToResend))
    setTimer(30)
    setOtp(['', '', '', '', '', ''])
    otpRefs.current[0]?.focus()
  }

  // Change mobile
  const handleChangeMobile = () => {
    setStep(1)
    setOtp(['', '', '', '', '', ''])
    dispatch(resetOtpState())
  }

  const otpValue = otp.join('')
  const isOtpComplete = otpValue.length === 6

  // Show loading screen during token authentication
  if (tokenLoading) {
    return (
      <>
        <style>{`
          .token-loading-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #22b14c 0%, #0e7a34 24%, #066058 52%, #04305a 78%, #021a44 100%);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          .token-loading-card {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 28px;
            padding: 3rem 2.5rem;
            text-align: center;
            box-shadow: 0 20px 60px rgba(4, 26, 68, 0.25);
            backdrop-filter: blur(20px);
            max-width: 400px;
            width: 100%;
            margin: 1.5rem;
          }
          .token-loading-logo {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: linear-gradient(135deg, #22b14c, #04305a);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            padding: 0.75rem;
          }
          .token-loading-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .token-loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #22b14c;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          }
          .token-loading-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
          }
          .token-loading-text {
            font-size: 0.9375rem;
            color: #6b7280;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="token-loading-wrapper">
          <div className="token-loading-card">
            <div className="token-loading-logo">
              <img src={logo} alt="Recomm" />
            </div>
            <div className="token-loading-spinner" />
            <h2 className="token-loading-title">Signing you in...</h2>
            <p className="token-loading-text">Please wait while we authenticate your account</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        
        .auth-wrapper {
          --rc-green: #0e7a34;
          --rc-green-bright: #22b14c;
          --rc-green-light: #59b418;
          --rc-teal: #066058;
          --rc-navy: #04305a;
          --rc-navy-deep: #021a44;
          --rc-navy-text: #0a2540;
          
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg,
            var(--rc-green-bright) 0%,
            var(--rc-green) 24%,
            var(--rc-teal) 52%,
            var(--rc-navy) 78%,
            var(--rc-navy-deep) 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 1.5rem;
        }

        .auth-bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: 
            radial-gradient(circle at 20px 20px, white 2px, transparent 0);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
        }
        
        .auth-blob-1 {
          width: 500px;
          height: 500px;
          background: rgba(34, 177, 76, 0.3);
          top: -150px;
          left: -150px;
          animation-delay: 0s;
        }
        
        .auth-blob-2 {
          width: 400px;
          height: 400px;
          background: rgba(4, 48, 90, 0.25);
          bottom: -100px;
          right: -100px;
          animation-delay: 7s;
        }
        
        .auth-blob-3 {
          width: 300px;
          height: 300px;
          background: rgba(6, 96, 88, 0.2);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
        }

        .auth-lang-selector {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 28px;
          box-shadow: 
            0 20px 60px rgba(4, 26, 68, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.5);
          padding: 3rem 2.5rem;
          backdrop-filter: blur(20px);
        }

        .auth-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .auth-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--rc-green-bright), var(--rc-navy));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 8px 24px rgba(34, 177, 76, 0.4),
            0 0 0 4px rgba(34, 177, 76, 0.1);
          padding: 0.75rem;
        }

        .auth-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .auth-brand {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .auth-brand-re { color: var(--rc-green); }
        .auth-brand-comm { color: var(--rc-navy-text); }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem;
        }

        .auth-subtitle {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
        }

        .auth-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .auth-step {
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-step.inactive { width: 24px; }
        
        .auth-step.active {
          width: 48px;
          background: linear-gradient(90deg, var(--rc-green-bright), var(--rc-navy));
        }

        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fca5a5;
          border-radius: 14px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-error-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          color: #dc2626;
        }

        .auth-error-text {
          flex: 1;
          font-size: 0.875rem;
          color: #991b1b;
          font-weight: 500;
          line-height: 1.5;
        }

        .auth-error-close {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: #dc2626;
          font-size: 1.25rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .auth-error-close:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        .auth-form-group {
          margin-bottom: 1.5rem;
        }

        .auth-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .auth-input-wrapper {
          position: relative;
        }

        .auth-mobile-container {
          display: flex;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s;
          background: white;
        }

        .auth-mobile-container:focus-within {
          border-color: var(--rc-green);
          box-shadow: 0 0 0 4px rgba(14, 122, 52, 0.1);
        }

        .auth-mobile-container.error {
          border-color: #ef4444;
        }

        .auth-mobile-container.error:focus-within {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .auth-country-code {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-right: 2px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 0.9375rem;
        }

        .auth-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
          font-family: inherit;
        }

        .auth-input::placeholder {
          color: #9ca3af;
        }

        .auth-input-error {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-top: 0.5rem;
          font-size: 0.8125rem;
          color: #ef4444;
          font-weight: 500;
        }

        .auth-otp-sent {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 1px solid #6ee7b7;
          border-radius: 14px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .auth-otp-sent-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--rc-green-bright), var(--rc-navy));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .auth-otp-sent-content {
          flex: 1;
        }

        .auth-otp-sent-label {
          font-size: 0.75rem;
          color: #065f46;
          margin: 0 0 0.25rem;
          font-weight: 500;
        }

        .auth-otp-sent-number {
          font-size: 1rem;
          font-weight: 700;
          color: #064e3b;
          margin: 0;
        }

        .auth-change-btn {
          background: white;
          border: 1px solid #6ee7b7;
          color: var(--rc-green);
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .auth-change-btn:hover {
          background: #dcfce7;
          border-color: var(--rc-green);
        }

        .auth-otp-container {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .auth-otp-input {
          width: 52px;
          height: 60px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          background: white;
        }

        .auth-otp-input:focus {
          border-color: var(--rc-navy);
          box-shadow: 0 0 0 4px rgba(4, 48, 90, 0.1);
          transform: scale(1.05);
        }

        .auth-otp-input.filled {
          border-color: var(--rc-green);
          background: linear-gradient(135deg, #f0fdf4, white);
        }

        .auth-otp-hint {
          text-align: center;
          font-size: 0.8125rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .auth-submit-btn {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--rc-green) 0%, var(--rc-navy) 100%);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          box-shadow: 
            0 10px 25px rgba(4, 48, 90, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .auth-submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .auth-submit-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 15px 35px rgba(4, 48, 90, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .auth-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-resend {
          text-align: center;
          margin-top: 1.25rem;
        }

        .auth-timer {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .auth-timer strong {
          color: var(--rc-green);
          font-weight: 700;
        }

        .auth-resend-btn {
          background: none;
          border: none;
          color: var(--rc-green);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .auth-resend-btn:hover:not(:disabled) {
          background: #f0fdf4;
        }

        .auth-resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.75rem 0;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        }

        .auth-divider-text {
          font-size: 0.8125rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .auth-footer-link {
          text-align: center;
          font-size: 0.9375rem;
          color: #6b7280;
        }

        .auth-footer-link a {
          color: var(--rc-green);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-footer-link a:hover {
          color: var(--rc-navy);
          text-decoration: underline;
        }

        .auth-copyright {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 480px) {
          .auth-wrapper {
            padding: 1rem;
          }

          .auth-card {
            padding: 2rem 1.5rem;
          }

          .auth-logo {
            width: 48px;
            height: 48px;
          }

          .auth-brand {
            font-size: 1.5rem;
          }

          .auth-title {
            font-size: 1.25rem;
          }

          .auth-otp-input {
            width: 44px;
            height: 52px;
            font-size: 1.25rem;
          }

          .auth-otp-container {
            gap: 0.375rem;
          }
        }
      `}</style>

      <div className="auth-wrapper">
        <div className="auth-bg-pattern" />
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />

        <div className="auth-container">
          <div className="auth-lang-selector">
            <LanguageSelector />
          </div>

          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Logo */}
            <div className="auth-logo-container">
              <div className="auth-logo">
                <img src={logo} alt="Recomm" />
              </div>
              <h1 className="auth-brand">
                <span className="auth-brand-re">Re</span>
                <span className="auth-brand-comm">Comm</span>
              </h1>
            </div>

            {/* Header */}
            <div className="auth-header">
              <h2 className="auth-title">
                {t('auth.welcomeBack') || 'Welcome back! 👋'}
              </h2>
              <p className="auth-subtitle">
                {t('auth.loginSubtitle') || 'Sign in to manage your store'}
              </p>
            </div>

            {/* Steps */}
            <div className="auth-steps">
              <div className={`auth-step ${step === 1 ? 'active' : 'inactive'}`} />
              <div className={`auth-step ${step === 2 ? 'active' : 'inactive'}`} />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span className="auth-error-icon">⚠️</span>
                  <span className="auth-error-text">{error}</span>
                  <button
                    className="auth-error-close"
                    onClick={() => dispatch(clearError())}
                    aria-label="Close error"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  onSubmit={handleSendOtp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="auth-form-group">
                    <label className="auth-label">
                      <FaMobileAlt size={14} />
                      {t('auth.mobileNumber') || 'Mobile Number'}
                    </label>
                    <div className={`auth-mobile-container ${mobileError ? 'error' : ''}`}>
                      <span className="auth-country-code">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        className="auth-input"
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={handleMobileChange}
                        maxLength={10}
                        autoFocus
                        aria-label="Mobile number"
                        aria-invalid={!!mobileError}
                        aria-describedby={mobileError ? "mobile-error" : undefined}
                      />
                    </div>
                    {mobileError && (
                      <div className="auth-input-error" id="mobile-error" role="alert">
                        <span>⚠</span> {mobileError}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading || mobile.length !== 10 || !!mobileError}
                  >
                    {loading ? (
                      <>
                        <div className="auth-spinner" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <FaArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or</span>
                    <div className="auth-divider-line" />
                  </div>

                  <div className="auth-footer-link">
                    Don't have an account?{' '}
                    <Link to="/register">Register here</Link>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  onSubmit={handleVerifyOtp}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="auth-otp-sent">
                    <div className="auth-otp-sent-icon">
                      <FaCheckCircle size={18} />
                    </div>
                    <div className="auth-otp-sent-content">
                      <p className="auth-otp-sent-label">OTP sent to</p>
                      <p className="auth-otp-sent-number">
                        {maskedMobile || `+91 ${mobileRef.current}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="auth-change-btn"
                      onClick={handleChangeMobile}
                    >
                      Change
                    </button>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label">
                      <FaShieldAlt size={14} />
                      Enter OTP
                    </label>
                    <div className="auth-otp-container" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="tel"
                          className={`auth-otp-input ${digit ? 'filled' : ''}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          maxLength={1}
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>
                    <p className="auth-otp-hint">
                      Enter the 6-digit code sent to your mobile
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading || !isOtpComplete}
                  >
                    {loading ? (
                      <>
                        <div className="auth-spinner" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FaShieldAlt size={16} />
                        Verify & Login
                      </>
                    )}
                  </button>

                  <div className="auth-resend">
                    {timer > 0 ? (
                      <p className="auth-timer">
                        Resend OTP in <strong>{timer}s</strong>
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="auth-resend-btn"
                        onClick={handleResendOtp}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="auth-copyright">
            © {new Date().getFullYear()} Recomm. All rights reserved.
          </p>
        </div>
      </div>
    </>
  )
}

export default Login