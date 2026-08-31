import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  registerSendOtp,
  registerVerifyOtp,
  clearError,
  resetOtpState,
} from '../redux/authSlice'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import {
  FaUser,
  FaMobileAlt,
  FaEnvelope,
  FaStore,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa'
import logo from '../assets/logo.png'

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    shop_name: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(0)
  const [errors, setErrors] = useState({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const otpRefs = useRef([])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, otpSent } = useSelector((state) => state.auth)
  const { t } = useLanguage()

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  // Auto-advance when OTP sent
  useEffect(() => {
    if (otpSent && step === 1) {
      setStep(2)
      setTimer(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }, [otpSent, step])

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(resetOtpState())
    }
  }, [dispatch])

  // Field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters'
        return ''

      case 'mobile':
        if (!value) return 'Mobile number is required'
        if (value.length !== 10) return 'Mobile number must be 10 digits'
        if (!/^[6-9]/.test(value)) return 'Please enter a valid Indian mobile number'
        return ''

      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
        return ''

      case 'shop_name':
        if (!value.trim()) return 'Shop name is required'
        if (value.trim().length < 2) return 'Shop name must be at least 2 characters'
        return ''

      default:
        return ''
    }
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === 'mobile') {
      processedValue = value.replace(/\D/g, '').slice(0, 10)
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))

    // Real-time validation
    if (processedValue) {
      const error = validateField(name, processedValue)
      setErrors((prev) => ({ ...prev, [name]: error }))
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

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
    e.stopPropagation()

    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!acceptedTerms) {
      return
    }

    try {
      const result = await dispatch(registerSendOtp(formData))

      if (registerSendOtp.fulfilled.match(result)) {
        setStep(2)
        setTimer(30)
      }
    } catch (error) {
      console.error('Error in register handleSendOtp:', error)
    }
  }

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    const otpValue = otp.join('')
    if (otpValue.length !== 6) return

    const result = await dispatch(
      registerVerifyOtp({ mobile: formData.mobile, otp: otpValue })
    )

    if (registerVerifyOtp.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  // Resend OTP
  const handleResendOtp = () => {
    dispatch(registerSendOtp(formData))
    setTimer(30)
    setOtp(['', '', '', '', '', ''])
    otpRefs.current[0]?.focus()
  }

  // Back to form
  const handleBackToForm = () => {
    setStep(1)
    setOtp(['', '', '', '', '', ''])
    dispatch(resetOtpState())
  }

  const isStep1Valid =
    formData.name.trim() &&
    formData.mobile.length === 10 &&
    formData.email.trim() &&
    formData.shop_name.trim() &&
    acceptedTerms &&
    !Object.values(errors).some((err) => err)

  const otpValue = otp.join('')
  const isOtpComplete = otpValue.length === 6

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
          max-width: 500px;
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
          margin-bottom: 1.25rem;
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

        .auth-input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          z-index: 1;
        }

        .auth-input-container {
          position: relative;
        }

        .auth-input-container input {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          padding: 1rem 1rem 1rem 2.75rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #111827;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          background: white;
        }

        .auth-input-container input:focus {
          border-color: var(--rc-green);
          box-shadow: 0 0 0 4px rgba(14, 122, 52, 0.1);
        }

        .auth-input-container input.error {
          border-color: #ef4444;
        }

        .auth-input-container input.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .auth-input-container input::placeholder {
          color: #9ca3af;
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

        .auth-mobile-input-wrapper {
          flex: 1;
          position: relative;
        }

        .auth-mobile-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .auth-mobile-input-wrapper input {
          width: 100%;
          border: none;
          outline: none;
          padding: 1rem 1rem 1rem 2.75rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #111827;
          font-family: inherit;
        }

        .auth-mobile-input-wrapper input::placeholder {
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

        .auth-checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          margin: 1.5rem 0;
        }

        .auth-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          margin-top: 2px;
          accent-color: var(--rc-green);
        }

        .auth-checkbox:checked {
          background: var(--rc-green);
          border-color: var(--rc-green);
        }

        .auth-checkbox-label {
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.5;
          cursor: pointer;
        }

        .auth-checkbox-label a {
          color: var(--rc-green);
          font-weight: 600;
          text-decoration: none;
        }

        .auth-checkbox-label a:hover {
          text-decoration: underline;
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

        .auth-footer-link {
          text-align: center;
          font-size: 0.9375rem;
          color: #6b7280;
          margin-top: 1.5rem;
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

          .auth-form-group {
            margin-bottom: 1rem;
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
              <h2 className="auth-title">Create your account 🎉</h2>
              <p className="auth-subtitle">Join us and start managing your store</p>
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
                  {/* Name */}
                  <div className="auth-form-group">
                    <label className="auth-label">
                      <FaUser size={14} />
                      Full Name
                    </label>
                    <div className="auth-input-container">
                      <FaUser className="auth-input-icon" size={14} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                        autoFocus
                        aria-label="Full name"
                        aria-invalid={!!errors.name}
                      />
                    </div>
                    {errors.name && (
                      <div className="auth-input-error" role="alert">
                        <span>⚠</span> {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Mobile */}
                  <div className="auth-form-group">
                    <label className="auth-label">
                      <FaMobileAlt size={14} />
                      Mobile Number
                    </label>
                    <div className={`auth-mobile-container ${errors.mobile ? 'error' : ''}`}>
                      <span className="auth-country-code">🇮🇳 +91</span>
                      <div className="auth-mobile-input-wrapper">
                        <FaMobileAlt className="auth-mobile-icon" size={14} />
                        <input
                          type="tel"
                          name="mobile"
                          placeholder="Enter 10-digit mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          maxLength={10}
                          aria-label="Mobile number"
                          aria-invalid={!!errors.mobile}
                        />
                      </div>
                    </div>
                    {errors.mobile && (
                      <div className="auth-input-error" role="alert">
                        <span>⚠</span> {errors.mobile}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="auth-form-group">
                    <label className="auth-label">
                      <FaEnvelope size={14} />
                      Email Address
                    </label>
                    <div className="auth-input-container">
                      <FaEnvelope className="auth-input-icon" size={14} />
                      <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        aria-label="Email address"
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    {errors.email && (
                      <div className="auth-input-error" role="alert">
                        <span>⚠</span> {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Shop Name */}
                  <div className="auth-form-group">
                    <label className="auth-label">
                      <FaStore size={14} />
                      Shop Name
                    </label>
                    <div className="auth-input-container">
                      <FaStore className="auth-input-icon" size={14} />
                      <input
                        type="text"
                        name="shop_name"
                        placeholder="Your shop name"
                        value={formData.shop_name}
                        onChange={handleChange}
                        className={errors.shop_name ? 'error' : ''}
                        aria-label="Shop name"
                        aria-invalid={!!errors.shop_name}
                      />
                    </div>
                    {errors.shop_name && (
                      <div className="auth-input-error" role="alert">
                        <span>⚠</span> {errors.shop_name}
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="auth-checkbox-container">
                    <input
                      type="checkbox"
                      id="terms"
                      className="auth-checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      aria-label="Accept terms and conditions"
                    />
                    <label htmlFor="terms" className="auth-checkbox-label">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading || !isStep1Valid}
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

                  <div className="auth-footer-link">
                    Already have an account? <Link to="/login">Login here</Link>
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
                      <p className="auth-otp-sent-number">+91 {formData.mobile}</p>
                    </div>
                    <button
                      type="button"
                      className="auth-change-btn"
                      onClick={handleBackToForm}
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
                        Verify & Register
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

export default Register