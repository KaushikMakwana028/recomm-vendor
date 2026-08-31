import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createOffer, updateOffer } from '../redux/offerSlice'
import { useLanguage } from '../contexts/LanguageContext'
import { FaSave, FaTimes, FaTag, FaPercent, FaRupeeSign } from 'react-icons/fa'

const AddOffer = ({ offer, isEdit, onClose }) => {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { actionLoading, actionError } = useSelector((state) => state.offer)

  const [formData, setFormData] = useState({
    name: '',
    offer_type: 'flat',
    discount_value: '',
    min_amount: '',
    start_date: '',
    end_date: '',
    is_active: 1,
  })

  const [errors, setErrors] = useState({})

  // ── Populate form in edit mode ──────────────────────────
  useEffect(() => {
    if (isEdit && offer) {
      setFormData({
        name: offer.name ?? '',
        offer_type: offer.offer_type ?? 'flat',
        discount_value: offer.discount_value ?? '',
        min_amount: offer.min_amount ?? '',
        start_date: offer.start_date ?? '',
        end_date: offer.end_date ?? '',
        is_active: offer.is_active ?? 1,
      })
    }
  }, [offer, isEdit])

  // ── Field validation ────────────────────────────────────
  const validate = () => {
    const e = {}

    if (!formData.name.trim()) {
      e.name = 'Offer name is required'
    } else if (formData.name.trim().length < 3) {
      e.name = 'Name must be at least 3 characters'
    }

    if (!formData.discount_value && formData.discount_value !== 0) {
      e.discount_value = 'Discount value is required'
    } else if (Number(formData.discount_value) <= 0) {
      e.discount_value = 'Discount must be greater than 0'
    } else if (formData.offer_type === 'percentage' && Number(formData.discount_value) > 100) {
      e.discount_value = 'Percentage cannot exceed 100'
    }

    if (!formData.min_amount && formData.min_amount !== 0) {
      e.min_amount = 'Minimum amount is required'
    } else if (Number(formData.min_amount) < 0) {
      e.min_amount = 'Minimum amount cannot be negative'
    }

    if (!formData.start_date) {
      e.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      e.end_date = 'End date is required'
    } else if (formData.start_date && formData.end_date < formData.start_date) {
      e.end_date = 'End date must be after start date'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Handle input change ─────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }))

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: formData.name.trim(),
      offer_type: formData.offer_type,
      discount_value: Number(formData.discount_value),
      min_amount: Number(formData.min_amount),
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    }

    let result

    if (isEdit) {
      result = await dispatch(updateOffer({ id: offer.id, offerData: payload }))
    } else {
      result = await dispatch(createOffer(payload))
    }

    const matched = isEdit
      ? updateOffer.fulfilled.match(result)
      : createOffer.fulfilled.match(result)

    if (matched) {
      onClose(true) // true = did save successfully
    }
    // if rejected, actionError in Redux shows the error — don't close
  }

  // ── Discount label helper ───────────────────────────────
  const discountPlaceholder =
    formData.offer_type === 'flat' ? 'e.g. 50' : 'e.g. 10'

  const discountLabel =
    formData.offer_type === 'flat' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'

  return (
    <>
      <style>{`
        .ao-form { font-family: 'Poppins', sans-serif; }

        .ao-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .ao-group { margin-bottom: 1.25rem; }

        .ao-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.375rem;
        }

        .ao-label span {
          color: #ef4444;
          margin-left: 2px;
        }

        .ao-input,
        .ao-select {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.6875rem 1rem;
          font-size: 0.9375rem;
          font-family: 'Poppins', sans-serif;
          color: #111827;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
        }

        .ao-input:focus,
        .ao-select:focus {
          border-color: #00204E;
          box-shadow: 0 0 0 3px rgba(0,32,78,0.1);
        }

        .ao-input.error,
        .ao-select.error {
          border-color: #ef4444;
        }

        .ao-input.error:focus,
        .ao-select.error:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .ao-input::placeholder { color: #9ca3af; }

        .ao-input-prefix {
          position: relative;
        }

        .ao-prefix-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }

        .ao-input-prefix .ao-input {
          padding-left: 2.25rem;
        }

        .ao-field-error {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 0.375rem;
          font-size: 0.78rem;
          color: #ef4444;
          font-weight: 500;
        }

        /* offer type selector */
        .ao-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
        }

        .ao-type-option {
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: #fff;
          font-family: 'Poppins', sans-serif;
        }

        .ao-type-option:hover {
          border-color: #00204E;
          background: #f8faff;
        }

        .ao-type-option.selected {
          border-color: #00204E;
          background: linear-gradient(135deg, #f0f4ff, #f8faff);
          box-shadow: 0 2px 8px rgba(0,32,78,0.1);
        }

        .ao-type-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ao-type-icon-flat    { background: #e0f2fe; color: #0369a1; }
        .ao-type-icon-percent { background: #dcfce7; color: #15803d; }

        .ao-type-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
          line-height: 1.2;
        }

        .ao-type-desc {
          font-size: 0.72rem;
          color: #6b7280;
          margin: 2px 0 0;
          line-height: 1.3;
        }

        /* toggle switch */
        .ao-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          background: #fafafa;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .ao-toggle-wrap:hover { border-color: #00204E; }

        .ao-toggle {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .ao-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }

        .ao-toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: #d1d5db;
          transition: background 0.25s;
          cursor: pointer;
        }

        .ao-toggle input:checked + .ao-toggle-track {
          background: linear-gradient(135deg, #00204E, #34A129);
        }

        .ao-toggle-thumb {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          top: 3px;
          left: 3px;
          transition: transform 0.25s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          pointer-events: none;
        }

        .ao-toggle input:checked ~ .ao-toggle-thumb {
          transform: translateX(20px);
        }

        .ao-toggle-label-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .ao-toggle-sub {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: auto;
        }

        /* action error */
        .ao-api-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 0.875rem 1rem;
          font-size: 0.8375rem;
          color: #991b1b;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        /* footer buttons */
        .ao-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.625rem;
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f3f4f6;
        }

        .ao-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.625rem 1.375rem;
          border-radius: 10px;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ao-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }

        .ao-btn-cancel {
          background: #f3f4f6;
          color: #374151;
          border: 1.5px solid #e5e7eb;
        }
        .ao-btn-cancel:hover:not(:disabled) { background: #e5e7eb; }

        .ao-btn-save {
          background: linear-gradient(135deg, #00204E, #34A129);
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,32,78,0.28);
        }
        .ao-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,32,78,0.38);
        }

        .ao-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ao-spin 0.75s linear infinite;
        }
        @keyframes ao-spin { to { transform: rotate(360deg); } }
      `}</style>

      <form className="ao-form" onSubmit={handleSubmit} noValidate>

        {/* ── Offer Details ──────────────────────────────── */}
        <p className="ao-section-title">Offer Details</p>

        {/* API error */}
        {actionError && (
          <div className="ao-api-error">
            ⚠️ {actionError}
          </div>
        )}

        {/* Name */}
        <div className="ao-group">
          <label className="ao-label">
            Offer Name <span>*</span>
          </label>
          <input
            type="text"
            name="name"
            className={`ao-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. ₹50 off above ₹1000"
            value={formData.name}
            onChange={handleChange}
            autoFocus={!isEdit}
          />
          {errors.name && (
            <p className="ao-field-error">⚠ {errors.name}</p>
          )}
        </div>

        {/* Offer Type */}
        <div className="ao-group">
          <label className="ao-label">
            Offer Type <span>*</span>
          </label>
          <div className="ao-type-grid">
            {[
              {
                value: 'flat',
                label: 'Flat Discount',
                desc: 'Fixed ₹ amount off',
                iconClass: 'ao-type-icon-flat',
                icon: <FaRupeeSign size={14} />,
              },
              {
                value: 'percentage',
                label: 'Percentage Off',
                desc: 'Percentage % discount',
                iconClass: 'ao-type-icon-percent',
                icon: <FaPercent size={14} />,
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`ao-type-option ${formData.offer_type === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, offer_type: opt.value }))
                  setErrors((prev) => ({ ...prev, discount_value: '' }))
                }}
              >
                <div className={`ao-type-icon ${opt.iconClass}`}>
                  {opt.icon}
                </div>
                <div>
                  <p className="ao-type-label">{opt.label}</p>
                  <p className="ao-type-desc">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Discount Value + Min Amount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="ao-group" style={{ margin: 0 }}>
            <label className="ao-label">
              {discountLabel} <span>*</span>
            </label>
            <div className="ao-input-prefix">
              {formData.offer_type === 'flat'
                ? <FaRupeeSign className="ao-prefix-icon" size={12} />
                : <FaPercent className="ao-prefix-icon" size={12} />
              }
              <input
                type="number"
                name="discount_value"
                className={`ao-input ${errors.discount_value ? 'error' : ''}`}
                placeholder={discountPlaceholder}
                value={formData.discount_value}
                onChange={handleChange}
                min={0}
                max={formData.offer_type === 'percentage' ? 100 : undefined}
              />
            </div>
            {errors.discount_value && (
              <p className="ao-field-error">⚠ {errors.discount_value}</p>
            )}
          </div>

          <div className="ao-group" style={{ margin: 0 }}>
            <label className="ao-label">
              Min Order Amount (₹) <span>*</span>
            </label>
            <div className="ao-input-prefix">
              <FaRupeeSign className="ao-prefix-icon" size={12} />
              <input
                type="number"
                name="min_amount"
                className={`ao-input ${errors.min_amount ? 'error' : ''}`}
                placeholder="e.g. 1000"
                value={formData.min_amount}
                onChange={handleChange}
                min={0}
              />
            </div>
            {errors.min_amount && (
              <p className="ao-field-error">⚠ {errors.min_amount}</p>
            )}
          </div>
        </div>

        {/* ── Schedule ───────────────────────────────────── */}
        <p className="ao-section-title" style={{ marginTop: '1.5rem' }}>
          Schedule
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="ao-group" style={{ margin: 0 }}>
            <label className="ao-label">
              Start Date <span>*</span>
            </label>
            <input
              type="date"
              name="start_date"
              className={`ao-input ${errors.start_date ? 'error' : ''}`}
              value={formData.start_date}
              onChange={handleChange}
            />
            {errors.start_date && (
              <p className="ao-field-error">⚠ {errors.start_date}</p>
            )}
          </div>

          <div className="ao-group" style={{ margin: 0 }}>
            <label className="ao-label">
              End Date <span>*</span>
            </label>
            <input
              type="date"
              name="end_date"
              className={`ao-input ${errors.end_date ? 'error' : ''}`}
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date || undefined}
            />
            {errors.end_date && (
              <p className="ao-field-error">⚠ {errors.end_date}</p>
            )}
          </div>
        </div>

        {/* ── Settings ───────────────────────────────────── */}
        <p className="ao-section-title" style={{ marginTop: '1.5rem' }}>
          Settings
        </p>

        <label
          className="ao-toggle-wrap"
          htmlFor="ao-is-active"
        >
          <div className="ao-toggle">
            <input
              id="ao-is-active"
              type="checkbox"
              name="is_active"
              checked={formData.is_active === 1}
              onChange={handleChange}
            />
            <div className="ao-toggle-track" />
            <div className="ao-toggle-thumb" />
          </div>
          <span className="ao-toggle-label-text">
            {formData.is_active === 1 ? 'Offer is Active' : 'Offer is Inactive'}
          </span>
          <span className="ao-toggle-sub">
            {formData.is_active === 1
              ? 'Customers can use this offer'
              : 'Offer is hidden from customers'}
          </span>
        </label>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="ao-footer">
          <button
            type="button"
            className="ao-btn ao-btn-cancel"
            onClick={() => onClose(false)}
            disabled={actionLoading}
          >
            <FaTimes size={13} />
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            className="ao-btn ao-btn-save"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="ao-spinner" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <FaSave size={13} />
                {isEdit
                  ? (t('common.save') || 'Save Changes')
                  : (t('offers.addOffer') || 'Create Offer')}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}

export default AddOffer