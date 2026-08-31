import { useState, useEffect } from 'react'
import { Row, Col, Card, Form, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FaClock, FaTruck, FaGlobe, FaMoon, FaSave } from 'react-icons/fa'
import { fetchProfile, updateProfile, clearStoreError } from '../redux/storeSlice'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'

const Settings = () => {
  const dispatch = useDispatch()
  const { profile, loading, saving, error, saveError } = useSelector((state) => state.store)
  const { t, language, changeLanguage } = useLanguage()

  const [success, setSuccess] = useState('')
  const [languageLoading, setLanguageLoading] = useState(false)
  const [formData, setFormData] = useState({
    opening_time: '',
    closing_time: '',
    is_holiday: 0,
    deliveryRadius: 5,
    deliveryAvailability: 'all_week',
  })

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        opening_time: profile.opening_time ? profile.opening_time.slice(0, 5) : '',
        closing_time: profile.closing_time ? profile.closing_time.slice(0, 5) : '',
        is_holiday: profile.is_holiday || 0,
        deliveryRadius: 5, // Default value since not in API
        deliveryAvailability: 'all_week', // Default value
      })
    }
  }, [profile])

  // Show success message when save is successful
  useEffect(() => {
    if (saving === false && !saveError && profile) {
      setSuccess('Settings updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }, [saving, saveError, profile])

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearStoreError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
  }

  const handleHolidayToggle = () => {
    setFormData((prev) => ({
      ...prev,
      is_holiday: prev.is_holiday === 1 ? 0 : 1
    }))
  }

  const handleLanguageChange = async (langCode) => {
    setLanguageLoading(true)
    try {
      await changeLanguage(langCode)
      setSuccess(t('settings.languageUpdated') || 'Language updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Language change error:', error)
    } finally {
      setLanguageLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Create FormData with only the fields that should be updated
    const submitData = new FormData()
    submitData.append('opening_time', formData.opening_time)
    submitData.append('closing_time', formData.closing_time)
    submitData.append('is_holiday', formData.is_holiday)

    // Dispatch update action
    dispatch(updateProfile(submitData))
  }

  const handleReset = () => {
    if (profile) {
      setFormData({
        opening_time: profile.opening_time ? profile.opening_time.slice(0, 5) : '',
        closing_time: profile.closing_time ? profile.closing_time.slice(0, 5) : '',
        is_holiday: profile.is_holiday || 0,
        deliveryRadius: 5,
        deliveryAvailability: 'all_week',
      })
    }
    dispatch(clearStoreError())
  }

  /* ── reusable section card ── */
  const Section = ({ icon: Icon, title, children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{ marginBottom: '1.5rem' }}
    >
      <div className="set-card">
        <div className="set-card-head">
          <div className="set-card-icon"><Icon /></div>
          <h5 className="set-card-title">{title}</h5>
        </div>
        <div className="set-card-body">
          {loading ? (
            <>
              <div className="set-sk set-sk-text mb-3" />
              <div className="set-sk set-sk-text mb-3" style={{ width: '70%' }} />
              <div className="set-sk set-sk-text" style={{ width: '50%' }} />
            </>
          ) : children}
        </div>
      </div>
    </motion.div>
  )

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div
              className="spinner-border"
              style={{ width: '3rem', height: '3rem', color: '#00204E' }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading settings...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error Loading Settings</h4>
              <p>{error}</p>
              <button
                className="btn btn-outline-danger"
                onClick={() => dispatch(fetchProfile())}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <style>{`
        @keyframes set-shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        .set-sk {
          background:linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size:200% 100%;
          animation:set-shimmer 1.6s infinite; border-radius:6px;
        }
        .set-sk-text { height:14px; }

        /* heading */
        .set-title { 
          font-size:1.5rem; font-weight:700; 
          color:#00204E; margin:0 0 4px; 
        }
        .set-sub   { font-size:0.875rem; color:#6b7280; margin:0; }

        /* success */
        .set-alert {
          display:flex; align-items:center; gap:8px;
          background:#dcfce7; color:#166534; border-radius:12px;
          padding:1rem 1.25rem; font-size:0.875rem; font-weight:500;
          margin-bottom:1.5rem;
        }
        .set-alert-close {
          margin-left:auto; background:none; border:none;
          cursor:pointer; color:#166534; font-size:1.1rem;
        }

        /* error alert */
        .set-error-alert {
          display:flex; align-items:center; gap:8px;
          background:#fef2f2; color:#991b1b; border-radius:12px;
          padding:1rem 1.25rem; font-size:0.875rem; font-weight:500;
          margin-bottom:1.5rem;
        }

        /* section card */
        .set-card {
          border:none; border-radius:16px;
          box-shadow:0 2px 10px rgba(0,32,78,0.06);
          background:#fff; overflow:hidden;
        }
        .set-card-head {
          display:flex; align-items:center; gap:12px;
          padding:1.125rem 1.375rem; border-bottom:1px solid #f3f4f6;
        }
        .set-card-icon {
          width:38px; height:38px; border-radius:10px;
          background:linear-gradient(135deg,rgba(0,32,78,0.1),rgba(52,161,41,0.1));
          color:#00204E; display:flex; align-items:center;
          justify-content:center; font-size:1rem; flex-shrink:0;
        }
        .set-card-title { 
          font-size:0.9375rem; font-weight:600; 
          color:#00204E; margin:0; 
        }
        .set-card-body  { padding:1.375rem; }

        /* form inputs */
        .set-input {
          width:100%; padding:0.625rem 0.875rem;
          border:1.5px solid #e5e7eb; border-radius:10px;
          font-size:0.875rem; font-family:'Poppins',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s; background:#fff;
        }
        .set-input:focus {
          border-color:#34A129; 
          box-shadow:0 0 0 3px rgba(52,161,41,0.1);
        }
        .set-label {
          font-size:0.8125rem; font-weight:600; color:#374151;
          display:block; margin-bottom:6px;
        }

        /* delivery radius */
        .set-range { accent-color:#34A129; width:100%; }
        .set-range-val {
          min-width:60px; padding:4px 12px; border-radius:20px;
          background:linear-gradient(135deg,#00204E,#34A129);
          color:#fff; font-size:0.8rem; font-weight:700; text-align:center;
        }

        /* language options */
        .set-lang-opt {
          display:flex; align-items:center; gap:10px;
          padding:0.875rem 1rem; border:2px solid #e5e7eb;
          border-radius:12px; cursor:pointer; transition:all 0.2s;
        }
        .set-lang-opt:hover { 
          border-color:#34A129; 
          background:#dcfce7; 
        }
        .set-lang-opt.active {
          border-color:#34A129;
          background:linear-gradient(135deg,rgba(52,161,41,0.08),rgba(24,144,49,0.08));
        }
        .set-lang-flag { font-size:1.375rem; }
        .set-lang-name { 
          font-weight:500; font-size:0.9rem; flex:1; 
          color:#00204E; 
        }
        .set-lang-check { color:#34A129; font-weight:700; }

        /* holiday toggle */
        .set-holiday-toggle {
          display:flex; justify-content:space-between; align-items:center;
          padding:1rem; background:#f8fafc; border-radius:12px;
          border:2px solid #e2e8f0; cursor:pointer; transition:all 0.2s;
        }
        .set-holiday-toggle:hover {
          border-color:#34A129; background:#f0f9ff;
        }
        .set-holiday-toggle.active {
          border-color:#f59e0b; background:#fefce8;
        }
        .set-holiday-info {
          display:flex; align-items:center; gap:12px;
        }
        .set-holiday-icon {
          font-size:1.5rem;
        }
        .set-holiday-text {
          font-weight:600; font-size:0.9rem; color:#00204E; margin:0 0 3px;
        }
        .set-holiday-desc {
          font-size:0.8rem; color:#6b7280; margin:0;
        }
        .set-holiday-switch {
          width:50px; height:24px; background:#e5e7eb; border-radius:12px;
          position:relative; transition:background-color 0.2s;
        }
        .set-holiday-switch.active {
          background:#f59e0b;
        }
        .set-holiday-switch::after {
          content:''; position:absolute; top:2px; left:2px;
          width:20px; height:20px; background:#fff; border-radius:50%;
          transition:transform 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.1);
        }
        .set-holiday-switch.active::after {
          transform:translateX(26px);
        }

        /* time display */
        .set-time-preview {
          display:flex; align-items:center; justify-content:center; gap:1rem;
          padding:1rem; background:#f0f9ff; border-radius:12px; margin-top:1rem;
        }
        .set-time-block { text-align:center; }
        .set-time-val {
          font-size:1.25rem; font-weight:700; color:#00204E;
          line-height:1; margin:0 0 4px;
        }
        .set-time-lbl {
          font-size:0.7rem; color:#9ca3af; font-weight:500;
          text-transform:uppercase; letter-spacing:0.5px; margin:0;
        }
        .set-time-sep { font-size:1.25rem; color:#d1d5db; font-weight:300; }

        /* save buttons */
        .set-action-bar {
          display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;
        }
        .set-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:0.625rem 1.5rem; border-radius:10px; border:none;
          font-size:0.875rem; font-weight:600; font-family:'Poppins',sans-serif;
          cursor:pointer; transition:all 0.2s;
        }
        .set-btn-cancel {
          background:#f3f4f6; color:#374151;
        }
        .set-btn-cancel:hover { background:#e5e7eb; }
        .set-btn-save {
          background:linear-gradient(135deg,#00204E,#34A129); color:#fff;
          box-shadow:0 4px 14px rgba(0,32,78,0.3);
        }
        .set-btn-save:hover:not(:disabled) { 
          transform:translateY(-2px); 
          box-shadow:0 8px 20px rgba(0,32,78,0.4); 
        }
        .set-btn-save:disabled { opacity:0.7; cursor:not-allowed; }

        /* status card */
        .set-status-card {
          border:none !important; border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          background:#fff; position:sticky; top:calc(64px + 1.75rem);
        }
        .set-status-item {
          display:flex; justify-content:space-between; align-items:center;
          padding:0.75rem 0; border-bottom:1px solid #f3f4f6;
          font-size:0.8125rem;
        }
        .set-status-item:last-child { border-bottom:none; }
        .set-status-key { color:#6b7280; }
        .set-status-val { font-weight:600; color:#00204E; }

        /* Custom switch styles */
        .form-check-input:checked {
          background-color: #34A129;
          border-color: #34A129;
        }
        .form-check-input:focus {
          border-color: #34A129;
          outline: 0;
          box-shadow: 0 0 0 0.25rem rgba(52, 161, 41, 0.25);
        }

        @media (max-width:991px) {
          .set-status-card { position:static; }
        }
      `}</style>

      {/* ── Heading ── */}
      <motion.div className="mb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="set-title">{t('settings.title') || 'Settings'}</h2>
        <p className="set-sub">Manage your store preferences and settings</p>
      </motion.div>

      {/* ── Success ── */}
      {success && (
        <motion.div className="set-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅ {success}
          <button className="set-alert-close" onClick={() => setSuccess('')}>×</button>
        </motion.div>
      )}

      {/* ── Error Alert ── */}
      {saveError && (
        <motion.div className="set-error-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {saveError}
          <button
            className="set-alert-close"
            onClick={() => dispatch(clearStoreError())}
            style={{ color: '#991b1b' }}
          >
            ×
          </button>
        </motion.div>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>

            {/* Store Timings - Editable */}
            <Section icon={FaClock} title={t('settings.storeTimings') || 'Store Timings'} delay={0.08}>
              <Row className="g-3">
                <Col md={6}>
                  <label className="set-label">Opening Time</label>
                  <input
                    className="set-input"
                    type="time"
                    name="opening_time"
                    value={formData.opening_time}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={6}>
                  <label className="set-label">Closing Time</label>
                  <input
                    className="set-input"
                    type="time"
                    name="closing_time"
                    value={formData.closing_time}
                    onChange={handleChange}
                    required
                  />
                </Col>

                {/* Live timing preview */}
                {(formData.opening_time || formData.closing_time) && (
                  <Col md={12}>
                    <div className="set-time-preview">
                      <div className="set-time-block">
                        <p className="set-time-val">
                          {formData.opening_time || '--:--'}
                        </p>
                        <p className="set-time-lbl">Opens</p>
                      </div>
                      <span className="set-time-sep">→</span>
                      <div className="set-time-block">
                        <p className="set-time-val">
                          {formData.closing_time || '--:--'}
                        </p>
                        <p className="set-time-lbl">Closes</p>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Section>

            {/* Holiday Mode - Editable */}
            <Section icon={FaMoon} title={t('settings.holidayMode') || 'Holiday Mode'} delay={0.14}>
              <div
                className={`set-holiday-toggle ${formData.is_holiday === 1 ? 'active' : ''}`}
                onClick={handleHolidayToggle}
              >
                <div className="set-holiday-info">
                  <span className="set-holiday-icon">
                    {formData.is_holiday === 1 ? '🌙' : '🏪'}
                  </span>
                  <div>
                    <p className="set-holiday-text">
                      Holiday Mode {formData.is_holiday === 1 ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="set-holiday-desc">
                      {formData.is_holiday === 1
                        ? 'Store will appear closed and won\'t accept new orders'
                        : 'Store is operating normally and accepting orders'
                      }
                    </p>
                  </div>
                </div>
                <div className={`set-holiday-switch ${formData.is_holiday === 1 ? 'active' : ''}`} />
              </div>
            </Section>

            {/* Delivery Settings - Editable */}
            <Section icon={FaTruck} title={t('settings.deliverySettings') || 'Delivery Settings'} delay={0.20}>
              <Row className="g-3">
                <Col md={6}>
                  <label className="set-label">Delivery Radius</label>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="range"
                      className="set-range"
                      name="deliveryRadius"
                      value={formData.deliveryRadius}
                      onChange={handleChange}
                      min="2"
                      max="10"
                      step="1"
                    />
                    <div className="set-range-val">{formData.deliveryRadius} km</div>
                  </div>
                </Col>
                <Col md={6}>
                  <label className="set-label">Delivery Availability</label>
                  <select
                    className="set-input"
                    name="deliveryAvailability"
                    value={formData.deliveryAvailability}
                    onChange={handleChange}
                  >
                    <option value="all_week">All Week</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekends">Weekends Only</option>
                  </select>
                </Col>
              </Row>
            </Section>

            {/* Language Settings - Interactive */}
            <Section icon={FaGlobe} title={t('settings.language') || 'Language'} delay={0.26}>
              <Row className="g-3">
                {[
                  { code: 'en', name: 'English', flag: '🇬🇧' },
                  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
                  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
                ].map((lang) => (
                  <Col xs={12} md={4} key={lang.code}>
                    <div
                      className={`set-lang-opt ${language === lang.code ? 'active' : ''}`}
                      onClick={() => !languageLoading && handleLanguageChange(lang.code)}
                      style={{
                        opacity: languageLoading ? 0.7 : 1,
                        cursor: languageLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span className="set-lang-flag">{lang.flag}</span>
                      <span className="set-lang-name">{lang.name}</span>
                      {language === lang.code && !languageLoading && (
                        <span className="set-lang-check">✓</span>
                      )}
                      {languageLoading && language === lang.code && (
                        <div
                          className="spinner-border spinner-border-sm"
                          style={{ width: '1rem', height: '1rem' }}
                        />
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Section>

            {/* Action Buttons */}
            <div className="set-action-bar">
              <button
                type="button"
                className="set-btn set-btn-cancel"
                onClick={handleReset}
                disabled={saving}
              >
                Reset
              </button>
              <button
                type="submit"
                className="set-btn set-btn-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm"
                      style={{ width: '0.875rem', height: '0.875rem' }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={12} />
                    Save Settings
                  </>
                )}
              </button>
            </div>

          </Col>

          {/* ── Quick Status Card ── */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="set-status-card">
                <Card.Body style={{ padding: '1.375rem' }}>
                  <h5 style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#00204E',
                    marginBottom: '1.25rem'
                  }}>
                    Current Settings
                  </h5>
                  {[
                    {
                      key: 'Store Status',
                      val: formData.is_holiday === 1 ? '🔴 Holiday Mode' : '🟢 Open',
                      valStyle: { color: formData.is_holiday === 1 ? '#dc2626' : '#34A129' },
                    },
                    {
                      key: 'Store Name',
                      val: profile?.shop_name || '—'
                    },
                    {
                      key: 'Timings',
                      val: formData.opening_time && formData.closing_time
                        ? `${formData.opening_time} - ${formData.closing_time}`
                        : '—'
                    },
                    {
                      key: 'Delivery Radius',
                      val: `${formData.deliveryRadius} km`
                    },
                    {
                      key: 'Delivery Days',
                      val: formData.deliveryAvailability === 'all_week' ? 'All Week' :
                        formData.deliveryAvailability === 'weekdays' ? 'Weekdays' : 'Weekends'
                    },
                    {
                      key: 'Language',
                      val: language === 'en' ? 'English' : language === 'gu' ? 'ગુજરાતી' : 'हिंदी'
                    },
                  ].map(({ key, val, valStyle }) => (
                    <div className="set-status-item" key={key}>
                      <span className="set-status-key">{key}</span>
                      <span className="set-status-val" style={valStyle}>{val}</span>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Form>
    </Layout>
  )
}

export default Settings