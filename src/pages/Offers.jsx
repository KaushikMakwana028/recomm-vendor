import { useState, useEffect, useCallback } from 'react'
import { Row, Col, Card, Modal } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaPlus, FaEdit, FaTrash, FaTags,
  FaToggleOn, FaToggleOff, FaExclamationTriangle,
  FaSync,
} from 'react-icons/fa'
import {
  fetchOffers,
  deleteOffer,
  toggleOfferStatus,
  clearError,
} from '../redux/offerSlice'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'
import AddOffer from './AddOffer'

// ── helpers ──────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ─────────────────────────────────────────────────────────
const Offers = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [success, setSuccess] = useState('')

  const { offers, stats, loading, actionLoading, error, actionError } =
    useSelector((state) => state.offer)

  const dispatch = useDispatch()
  const { t } = useLanguage()

  // ── fetch on mount ────────────────────────────────────
  useEffect(() => {
    dispatch(fetchOffers())
  }, [dispatch])

  // ── clear action error when modals close ──────────────
  useEffect(() => {
    if (!showAddModal && !showEditModal) {
      dispatch(clearError())
    }
  }, [showAddModal, showEditModal, dispatch])

  // ── success toast ─────────────────────────────────────
  const showSuccess = useCallback((msg) => {
    setSuccess(msg)
    const id = setTimeout(() => setSuccess(''), 3500)
    return () => clearTimeout(id)
  }, [])

  // ── delete ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedOffer) return
    const result = await dispatch(deleteOffer(selectedOffer.id))
    if (deleteOffer.fulfilled.match(result)) {
      setShowDeleteModal(false)
      setSelectedOffer(null)
      showSuccess(t('offers.offerDeleted') || 'Offer deleted successfully.')
    }
  }

  // ── toggle status ─────────────────────────────────────
  const handleToggle = (offer) => {
    if (offer._toggling) return
    dispatch(toggleOfferStatus({ id: offer.id, currentStatus: offer.is_active }))
  }

  // ── open edit ─────────────────────────────────────────
  const openEdit = (offer) => {
    setSelectedOffer(offer)
    setShowEditModal(true)
  }

  // ── open delete ───────────────────────────────────────
  const openDelete = (offer) => {
    setSelectedOffer(offer)
    setShowDeleteModal(true)
  }

  // ── close delete modal ────────────────────────────────
  const closeDeleteModal = () => {
    if (actionLoading) return
    setShowDeleteModal(false)
    setSelectedOffer(null)
  }

  return (
    <Layout>
      <style>{`
        /* ── animations ─────────────────────────── */
        @keyframes off-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes off-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .off-sk, .off-spinner { animation: none !important; }
        }

        /* ── skeleton ───────────────────────────── */
        .off-sk {
          background: linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: off-shimmer 1.6s infinite;
          border-radius: 6px;
        }
        .off-sk-text  { height: 14px; margin-bottom: 8px; }
        .off-sk-title { height: 20px; margin-bottom: 12px; }

        /* ── heading ────────────────────────────── */
        .off-title {
          font-size: 1.5rem; font-weight: 700;
          color: #00204E; margin: 0 0 4px;
        }
        .off-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }

        /* ── add button ─────────────────────────── */
        .off-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 0.625rem 1.375rem; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #00204E, #34A129);
          color: #fff; font-size: 0.875rem; font-weight: 600;
          font-family: 'Poppins', sans-serif; cursor: pointer;
          box-shadow: 0 4px 14px rgba(0,32,78,0.3);
          transition: all 0.2s;
        }
        .off-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,32,78,0.4);
        }
        .off-add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* ── alerts ─────────────────────────────── */
        .off-alert {
          display: flex; align-items: center; gap: 8px;
          background: #dcfce7; color: #166534; border-radius: 12px;
          padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          margin-bottom: 1.5rem; border: 1px solid #bbf7d0;
        }
        .off-alert-close {
          margin-left: auto; background: none; border: none;
          cursor: pointer; color: #166534; font-size: 1.1rem;
          width: 24px; height: 24px; display: flex;
          align-items: center; justify-content: center;
          border-radius: 6px;
        }
        .off-alert-close:hover { background: rgba(22,101,52,0.1); }

        .off-error-banner {
          display: flex; align-items: center; gap: 10px;
          background: #fef2f2; color: #991b1b;
          border: 1px solid #fecaca; border-radius: 12px;
          padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          margin-bottom: 1.5rem;
        }
        .off-error-banner button {
          margin-left: auto; background: none; border: none;
          cursor: pointer; color: #991b1b; font-size: 0.8125rem;
          font-weight: 600; display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 6px; font-family: inherit;
        }
        .off-error-banner button:hover { background: rgba(153,27,27,0.08); }

        /* ── stat cards ─────────────────────────── */
        .off-stat-card {
          border: none !important; border-radius: 14px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.06) !important;
          background: #fff; text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .off-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,32,78,0.1) !important;
        }
        .off-stat-val {
          font-size: 1.75rem; font-weight: 800;
          line-height: 1; margin: 0 0 4px;
        }
        .off-stat-lbl { font-size: 0.8rem; color: #6b7280; margin: 0; }
        .stat-color-1 { color: #00204E; }
        .stat-color-2 { color: #34A129; }
        .stat-color-3 { color: #6b7280; }

        /* ── offer card ─────────────────────────── */
        .off-card {
          border: 1.5px solid #e5e7eb !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 8px rgba(0,32,78,0.05) !important;
          background: #fff; margin-bottom: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .off-card:hover {
          border-color: #34A129 !important;
          box-shadow: 0 4px 16px rgba(52,161,41,0.12) !important;
        }
        .off-card.inactive { opacity: 0.62; }

        /* ── offer icon ─────────────────────────── */
        .off-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #00204E, #34A129);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.125rem; flex-shrink: 0;
        }

        /* ── chip ───────────────────────────────── */
        .off-chip {
          display: inline-block; padding: 2px 10px;
          border-radius: 20px; font-size: 0.72rem; font-weight: 600;
        }
        .chip-flat    { background: #f0f9ff; color: #00204E; }
        .chip-pct     { background: #dcfce7; color: #34A129; }
        .chip-active  { background: #dcfce7; color: #166534; }
        .chip-inactive{ background: #f3f4f6; color: #6b7280; }

        /* ── detail item ────────────────────────── */
        .off-detail-key {
          font-size: 0.72rem; color: #9ca3af; margin: 0 0 3px;
        }
        .off-detail-val {
          font-size: 0.875rem; font-weight: 700;
          color: #00204E; margin: 0;
        }

        /* ── action buttons ─────────────────────── */
        .off-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 13px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          font-family: 'Poppins', sans-serif; cursor: pointer;
          transition: all 0.18s;
        }
        .off-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .off-btn-edit  { border: 1.5px solid #00204E; background: none; color: #00204E; }
        .off-btn-edit:hover:not(:disabled)  { background: #00204E; color: #fff; }
        .off-btn-del   { border: 1.5px solid #ef4444; background: none; color: #ef4444; }
        .off-btn-del:hover:not(:disabled)   { background: #ef4444; color: #fff; }
        .off-toggle-btn {
          background: none; border: none; cursor: pointer;
          padding: 4px; border-radius: 6px; transition: opacity 0.2s;
        }
        .off-toggle-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .off-toggle-btn:hover:not(:disabled) { opacity: 0.8; }

        /* ── empty / error states ───────────────── */
        .off-empty {
          text-align: center; padding: 3rem 1rem;
          color: #9ca3af;
        }
        .off-empty p { margin: 0.5rem 0 0; font-size: 0.9375rem; }

        /* ── spinner ────────────────────────────── */
        .off-spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: off-spin 0.75s linear infinite;
        }
        .off-spinner-dark {
          border-color: rgba(0,32,78,0.2);
          border-top-color: #00204E;
        }

        /* ── modal footer btns ──────────────────── */
        .off-modal-btn {
          padding: 0.5rem 1.375rem; border-radius: 8px;
          border: none; font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer; font-size: 0.875rem;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s;
        }
        .off-modal-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .off-modal-btn-cancel {
          background: #f3f4f6; color: #374151;
        }
        .off-modal-btn-cancel:hover:not(:disabled) { background: #e5e7eb; }
        .off-modal-btn-delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }
        .off-modal-btn-delete:hover:not(:disabled) {
          box-shadow: 0 6px 18px rgba(239,68,68,0.45);
          transform: translateY(-1px);
        }

        /* ── action error in modal ──────────────── */
        .off-modal-error {
          background: #fef2f2; color: #991b1b;
          border: 1px solid #fecaca; border-radius: 10px;
          padding: 0.75rem 1rem; font-size: 0.8125rem;
          font-weight: 500; margin-top: 0.75rem;
        }
      `}</style>

      {/* ── Heading ─────────────────────────────────────── */}
      <motion.div
        className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="off-title">{t('offers.title') || 'Offers'}</h2>
          <p className="off-sub">Create and manage your store offers</p>
        </div>
        <button
          className="off-add-btn"
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        >
          <FaPlus size={12} />
          {t('offers.addOffer') || 'Add Offer'}
        </button>
      </motion.div>

      {/* ── Success toast ────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="off-alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            ✅ {success}
            <button
              className="off-alert-close"
              onClick={() => setSuccess('')}
              aria-label="Dismiss"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fetch error banner ───────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="off-error-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FaExclamationTriangle size={16} />
            {error}
            <button onClick={() => dispatch(fetchOffers())}>
              <FaSync size={11} /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ───────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        {[
          { label: t('offers.totalOffers') || 'Total Offers', value: stats.total, colorClass: 'stat-color-1' },
          { label: t('offers.activeOffers') || 'Active Offers', value: stats.active, colorClass: 'stat-color-2' },
          { label: t('offers.inactiveOffers') || 'Inactive Offers', value: stats.inactive, colorClass: 'stat-color-3' },
        ].map((item, i) => (
          <Col xs={4} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="off-stat-card">
                <Card.Body className="p-3">
                  {loading ? (
                    <>
                      <div className="off-sk off-sk-title mx-auto" style={{ width: '40%' }} />
                      <div className="off-sk off-sk-text mx-auto" style={{ width: '60%' }} />
                    </>
                  ) : (
                    <>
                      <p className={`off-stat-val ${item.colorClass}`}>{item.value}</p>
                      <p className="off-stat-lbl">{item.label}</p>
                    </>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ── Offers List ─────────────────────────────────── */}
      {loading ? (
        // Skeleton cards
        [1, 2, 3].map((i) => (
          <div key={i} className="off-card card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="off-sk" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="off-sk off-sk-title" style={{ width: '50%' }} />
                <div className="off-sk off-sk-text" style={{ width: '30%' }} />
              </div>
            </div>
            <div className="off-sk off-sk-text" />
            <div className="off-sk off-sk-text" style={{ width: '65%' }} />
          </div>
        ))
      ) : offers.length === 0 ? (
        <motion.div
          className="off-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FaTags size={44} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>{t('common.noData') || 'No offers yet'}</p>
          <button
            className="off-add-btn"
            style={{ margin: '1rem auto 0', display: 'inline-flex' }}
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus size={12} /> Create your first offer
          </button>
        </motion.div>
      ) : (
        offers.map((offer, idx) => (
          <motion.div
            key={offer.id}
            className={`off-card card ${offer.is_active === 0 ? 'inactive' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div style={{ padding: '1.25rem' }}>

              {/* top row */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="off-icon"><FaTags /></div>
                  <div>
                    <h5 style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: 700, color: '#00204E' }}>
                      {offer.name}
                    </h5>
                    <span className={`off-chip ${offer.offer_type === 'flat' ? 'chip-flat' : 'chip-pct'}`}>
                      {offer.offer_type_label}
                    </span>
                  </div>
                </div>
                <span className={`off-chip ${offer.is_active === 1 ? 'chip-active' : 'chip-inactive'}`}>
                  {offer.status_label}
                </span>
              </div>

              {/* details */}
              <Row className="g-2 mb-3">
                {[
                  {
                    key: t('offers.discount') || 'Discount',
                    val: offer.discount_label,
                    color: '#34A129',
                  },
                  {
                    key: t('offers.minAmount') || 'Min Amount',
                    val: `₹${Number(offer.min_amount).toLocaleString('en-IN')}`,
                  },
                  {
                    key: t('offers.startDate') || 'Start',
                    val: fmt(offer.start_date),
                  },
                  {
                    key: t('offers.endDate') || 'End',
                    val: fmt(offer.end_date),
                  },
                ].map(({ key, val, color }) => (
                  <Col xs={6} md={3} key={key}>
                    <p className="off-detail-key">{key}</p>
                    <p className="off-detail-val" style={color ? { color } : {}}>
                      {val}
                    </p>
                  </Col>
                ))}
              </Row>

              {/* actions */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* toggle */}
                <button
                  className="off-toggle-btn"
                  onClick={() => handleToggle(offer)}
                  disabled={!!offer._toggling}
                  title={offer.is_active === 1 ? 'Deactivate' : 'Activate'}
                  aria-label={offer.is_active === 1 ? 'Deactivate offer' : 'Activate offer'}
                >
                  {offer._toggling ? (
                    <span className="off-spinner off-spinner-dark" style={{ width: 22, height: 22 }} />
                  ) : offer.is_active === 1 ? (
                    <FaToggleOn size={26} color="#34A129" />
                  ) : (
                    <FaToggleOff size={26} color="#9ca3af" />
                  )}
                </button>

                {/* edit */}
                <button
                  className="off-btn off-btn-edit"
                  onClick={() => openEdit(offer)}
                  disabled={actionLoading}
                >
                  <FaEdit size={11} />
                  {t('common.edit') || 'Edit'}
                </button>

                {/* delete */}
                <button
                  className="off-btn off-btn-del"
                  onClick={() => openDelete(offer)}
                  disabled={actionLoading}
                >
                  <FaTrash size={11} />
                  {t('common.delete') || 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* ── Add Modal ───────────────────────────────────── */}
      <Modal
        show={showAddModal}
        onHide={() => !actionLoading && setShowAddModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700, color: '#00204E' }}>
            {t('offers.addOffer') || 'Add Offer'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showAddModal && (
            <AddOffer
              onClose={(didSave) => {
                setShowAddModal(false)
                if (didSave) showSuccess(t('offers.offerAdded') || 'Offer added successfully!')
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────── */}
      <Modal
        show={showEditModal}
        onHide={() => {
          if (actionLoading) return
          setShowEditModal(false)
          setSelectedOffer(null)
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700, color: '#00204E' }}>
            {t('offers.editOffer') || 'Edit Offer'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showEditModal && selectedOffer && (
            <AddOffer
              offer={selectedOffer}
              isEdit
              onClose={(didSave) => {
                setShowEditModal(false)
                setSelectedOffer(null)
                if (didSave) showSuccess(t('offers.offerUpdated') || 'Offer updated successfully!')
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────── */}
      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700, color: '#00204E' }}>
            {t('offers.deleteOffer') || 'Delete Offer'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: '#fef2f2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <FaTrash size={16} color="#ef4444" />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '0.9375rem', color: '#111827', fontWeight: 600 }}>
                Are you sure?
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                You are about to delete{' '}
                <strong style={{ color: '#00204E' }}>{selectedOffer?.name}</strong>.
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* action error inside modal */}
          {actionError && (
            <div className="off-modal-error">
              ⚠️ {actionError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', gap: '0.625rem' }}>
          <button
            className="off-modal-btn off-modal-btn-cancel"
            onClick={closeDeleteModal}
            disabled={actionLoading}
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            className="off-modal-btn off-modal-btn-delete"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="off-spinner" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash size={12} />
                {t('common.delete') || 'Delete'}
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </Layout>
  )
}

export default Offers