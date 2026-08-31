import { useState, useEffect } from 'react'
import { Row, Col, Card, Modal } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaPlus, FaEdit, FaTrash, FaSearch,
  FaBox, FaTimes, FaExclamationTriangle, FaSync,
} from 'react-icons/fa'
import {
  fetchCategories,
  fetchVendorProducts,
  deleteVendorProduct,
  clearProductError,
} from '../redux/productSlice'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'
import AddProduct from './AddProduct'
import EditProduct from './EditProduct'

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selected, setSelected] = useState(null)
  const [success, setSuccess] = useState('')

  const { products, categories, loading, actionLoading, error, actionError } =
    useSelector((s) => s.product)
  const dispatch = useDispatch()
  const { t } = useLanguage()

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchVendorProducts())
  }, [dispatch])

  // Success toast auto-dismiss
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 3500)
    return () => clearTimeout(timer)
  }, [success])

  // Filter products — search + category only
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = filterCategory === 'all' || p.category_id === Number(filterCategory)
    return matchSearch && matchCategory
  })

  // Delete handler
  const handleDelete = async () => {
    if (!selected) return
    const result = await dispatch(deleteVendorProduct(selected.id))
    if (deleteVendorProduct.fulfilled.match(result)) {
      setShowDelete(false)
      setSelected(null)
      setSuccess('Product deleted successfully!')
    }
  }

  return (
    <Layout>
      <style>{`
        @keyframes prod__shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .prod__sk {
          background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: prod__shimmer 1.5s infinite;
          border-radius: 7px;
        }

        .prod__title {
          font-size: 1.5rem; font-weight: 700;
          color: #00204E; margin: 0 0 4px;
        }
        .prod__sub { font-size: 0.875rem; color: #6b7280; margin: 0; }

        .prod__add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.75rem 1.75rem;
          background: linear-gradient(135deg,#00204E,#34A129);
          border: none; border-radius: 12px; color: #fff;
          font-size: 0.9375rem; font-weight: 600;
          font-family: 'Poppins',sans-serif;
          cursor: pointer; min-height: 46px;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 4px 14px rgba(0,32,78,0.32);
          white-space: nowrap;
        }
        .prod__add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(0,32,78,0.42);
        }
        .prod__add-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .prod__filter-card {
          border: none !important; border-radius: 14px !important;
          box-shadow: 0 1px 6px rgba(0,32,78,0.07) !important;
          margin-bottom: 1.25rem;
        }

        .prod__input {
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: .5625rem .875rem; height: 42px;
          font-size: .875rem; width: 100%; outline: none;
          font-family: 'Poppins',sans-serif;
          background: #fff; color: #374151;
          transition: border-color .2s, box-shadow .2s;
        }
        .prod__input:focus {
          border-color: #34A129;
          box-shadow: 0 0 0 3px rgba(52,161,41,0.08);
        }
        .prod__input-pl { padding-left: 2.5rem; }

        .prod__search-icon {
          position: absolute; left: .875rem; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af; pointer-events: none;
        }

        .prod__tbl-card {
          border: none !important; border-radius: 14px !important;
          box-shadow: 0 1px 6px rgba(0,32,78,0.07) !important;
          overflow: hidden;
        }
        .prod__tbl { width: 100%; border-collapse: collapse; }
        .prod__tbl th {
          padding: .875rem 1rem; font-size: .72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: .5px;
          color: #9ca3af; background: #f9fafb;
          border-bottom: 1px solid #f3f4f6; white-space: nowrap;
        }
        .prod__tbl td {
          padding: 1rem; font-size: .875rem;
          border-bottom: 1px solid #f9fafb; color: #374151;
          vertical-align: middle;
        }
        .prod__tbl tbody tr:hover td { background: rgba(52,161,41,0.02); }
        .prod__tbl tbody tr:last-child td { border-bottom: none; }

        .prod__img {
          width: 42px; height: 42px; border-radius: 10px;
          object-fit: cover; border: 1px solid #f3f4f6;
        }
        .prod__img-ph {
          width: 42px; height: 42px; border-radius: 10px;
          background: #f3f4f6; display: flex; align-items: center;
          justify-content: center; color: #9ca3af; flex-shrink: 0;
        }

        .prod__act-labeled {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 0.5rem 1rem; border-radius: 9px; border: 1.5px solid;
          font-size: 0.8125rem; font-weight: 600;
          font-family: 'Poppins',sans-serif; cursor: pointer;
          min-height: 36px; transition: all 0.18s; background: none;
        }
        .prod__act-labeled:disabled { opacity: 0.5; cursor: not-allowed; }
        .prod__act-edit  { border-color: #00204E; color: #00204E; }
        .prod__act-edit:hover:not(:disabled) { background: #00204E; color: #fff; }
        .prod__act-del   { border-color: #ef4444; color: #ef4444; }
        .prod__act-del:hover:not(:disabled)  { background: #ef4444; color: #fff; }

        .prod__pill {
          display: inline-block; padding: 4px 12px;
          border-radius: 6px; font-size: .8rem;
          font-weight: 500; background: #f3f4f6; color: #374151;
        }

        .prod__modal-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 0.625rem 1.5rem; border-radius: 10px; border: none;
          font-size: 0.9rem; font-weight: 600;
          font-family: 'Poppins',sans-serif;
          min-height: 42px; cursor: pointer; transition: all 0.2s;
        }
        .prod__modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .prod__modal-cancel { background: #f3f4f6; color: #374151; }
        .prod__modal-cancel:hover:not(:disabled) { background: #e5e7eb; }
        .prod__modal-danger {
          background: linear-gradient(135deg,#ef4444,#dc2626);
          color: #fff; box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }
        .prod__modal-danger:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(239,68,68,0.4);
        }

        .prod__empty {
          text-align: center; padding: 3.5rem 1rem; color: #9ca3af;
        }

        .prod__alert-success {
          display: flex; align-items: center; gap: 8px;
          background: #dcfce7; color: #166534;
          border: 1px solid #bbf7d0; border-radius: 12px;
          padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          margin-bottom: 1.5rem;
        }
        .prod__alert-error {
          display: flex; align-items: center; gap: 8px;
          background: #fef2f2; color: #991b1b;
          border: 1px solid #fecaca; border-radius: 12px;
          padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          margin-bottom: 1.5rem;
        }
        .prod__alert-close {
          margin-left: auto; background: none; border: none;
          cursor: pointer; font-size: 1rem; line-height: 1;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px;
        }
      `}</style>

      {/* ── Heading ─────────────────────────────────────────── */}
      <motion.div
        className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .35 }}
      >
        <div>
          <h2 className="prod__title">{t('products.title') || 'Products'}</h2>
          <p className="prod__sub">Manage your product inventory</p>
        </div>
        <div className="d-flex gap-2">
          {error && (
            <button
              className="prod__add-btn"
              style={{ background: '#6b7280' }}
              onClick={() => dispatch(fetchVendorProducts())}
            >
              <FaSync size={13} /> Retry
            </button>
          )}
          <button
            className="prod__add-btn"
            onClick={() => setShowAdd(true)}
            disabled={loading}
          >
            <FaPlus size={13} />
            {t('products.addProduct') || 'Add Product'}
          </button>
        </div>
      </motion.div>

      {/* ── Success toast ────────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="prod__alert-success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            ✅ {success}
            <button
              className="prod__alert-close"
              onClick={() => setSuccess('')}
              style={{ color: '#166534' }}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error toast ──────────────────────────────────────── */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            className="prod__alert-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FaExclamationTriangle size={15} />
            {error}
            <button
              className="prod__alert-close"
              onClick={() => dispatch(clearProductError())}
              style={{ color: '#991b1b' }}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters — search + category only ────────────────── */}
      <Card className="prod__filter-card">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">

            {/* Search */}
            <Col xs={12} sm={7} md={5}>
              <div style={{ position: 'relative' }}>
                <span className="prod__search-icon">
                  <FaSearch size={13} />
                </span>
                <input
                  type="text"
                  placeholder={`${t('common.search') || 'Search'} products…`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="prod__input prod__input-pl"
                />
              </div>
            </Col>

            {/* Category filter */}
            <Col xs={12} sm={5} md={3}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="prod__input"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* ── Table ───────────────────────────────────────────── */}
      <Card className="prod__tbl-card">
        <div className="table-responsive">
          <table className="prod__tbl">
            <thead>
              <tr>
                {['Product', 'Category', 'MRP', 'Selling Price', 'Stock', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                /* Skeleton rows — 6 columns now */
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}>
                        <div className="prod__sk" style={{ height: 15 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Product */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="prod__img" />
                        ) : (
                          <div className="prod__img-ph">
                            <FaBox size={14} />
                          </div>
                        )}
                        <div>
                          <div style={{
                            fontWeight: 600, color: '#00204E',
                            fontSize: '0.875rem', marginBottom: 2,
                          }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '.775rem', color: '#9ca3af' }}>
                            {p.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ color: '#6b7280' }}>{p.category}</td>

                    {/* MRP */}
                    <td style={{ color: '#6b7280' }}>₹{p.mrp.toFixed(2)}</td>

                    {/* Selling Price */}
                    <td style={{ fontWeight: 700, color: '#34A129' }}>
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td>
                      <span className="prod__pill">
                        {p.stock} {p.unit}
                      </span>
                    </td>

                    {/* Actions — Edit + Delete only */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="prod__act-labeled prod__act-edit"
                          onClick={() => { setSelected(p); setShowEdit(true) }}
                          disabled={actionLoading}
                        >
                          <FaEdit size={12} />
                          {t('common.edit') || 'Edit'}
                        </button>
                        <button
                          className="prod__act-labeled prod__act-del"
                          onClick={() => { setSelected(p); setShowDelete(true) }}
                          disabled={actionLoading}
                        >
                          <FaTrash size={12} />
                          {t('common.delete') || 'Delete'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="prod__empty">
                      <FaSearch size={36} color="#e5e7eb" />
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                        {t('common.noData') || 'No products found'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add Modal ────────────────────────────────────────── */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6' }}>
          <Modal.Title style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700, fontSize: '1rem', color: '#00204E',
          }}>
            {t('products.addProduct') || 'Add Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showAdd && (
            <AddProduct onClose={(didSave) => {
              setShowAdd(false)
              if (didSave) setSuccess('Product added successfully!')
            }} />
          )}
        </Modal.Body>
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <Modal
        show={showEdit}
        onHide={() => { setShowEdit(false); setSelected(null) }}
        size="lg" centered
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6' }}>
          <Modal.Title style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700, fontSize: '1rem', color: '#00204E',
          }}>
            {t('products.editProduct') || 'Edit Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showEdit && selected && (
            <EditProduct
              product={selected}
              onClose={(didSave) => {
                setShowEdit(false)
                setSelected(null)
                if (didSave) setSuccess('Product updated successfully!')
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────── */}
      <Modal
        show={showDelete}
        onHide={() => { setShowDelete(false); setSelected(null) }}
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6' }}>
          <Modal.Title style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700, fontSize: '1rem', color: '#00204E',
          }}>
            Delete Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontFamily: 'Poppins,sans-serif', padding: '1.25rem 1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: '#fef2f2', borderRadius: 12,
            padding: '1rem 1.125rem',
          }}>
            <FaExclamationTriangle
              size={18} color="#ef4444"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#00204E' }}>
                Delete <strong>{selected?.name}</strong>?
              </p>
              <p style={{ margin: 0, fontSize: '.8375rem', color: '#6b7280' }}>
                This action cannot be undone.
              </p>
            </div>
          </div>
          {actionError && (
            <div className="prod__alert-error" style={{ marginTop: '1rem', marginBottom: 0 }}>
              ⚠️ {actionError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <button
            className="prod__modal-btn prod__modal-cancel"
            onClick={() => { setShowDelete(false); setSelected(null) }}
            disabled={actionLoading}
          >
            <FaTimes size={13} />
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            className="prod__modal-btn prod__modal-danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Deleting…
              </>
            ) : (
              <>
                <FaTrash size={13} />
                {t('common.delete') || 'Delete'}
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </Layout>
  )
}

export default Products