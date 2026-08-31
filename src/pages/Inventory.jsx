import { useState, useEffect } from 'react'
import { Col, Row, Card, Modal } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaEdit, FaSearch, FaBox } from 'react-icons/fa'
import { fetchInventory, updateProductStock, clearInventoryError } from '../redux/inventorySlice'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [newStock, setNewStock] = useState('')
  const [success, setSuccess] = useState(false)

  const dispatch = useDispatch()
  const { t } = useLanguage()

  const {
    products,
    stats,
    alerts,
    loading,
    updateLoading,
    error,
    updateError,
  } = useSelector((state) => state.inventory)

  // ── Fetch inventory on mount ──────────────────────────────
  useEffect(() => {
    dispatch(fetchInventory())
  }, [dispatch])

  // ── Derived lists ─────────────────────────────────────────
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const lowStockProducts = alerts.low_stock_products || []
  const outOfStockProducts = alerts.out_of_stock_products || []

  // ── Handlers ─────────────────────────────────────────────
  const handleUpdateStock = async () => {
    if (!newStock || isNaN(newStock)) return

    const stockValue = parseInt(newStock)

    const result = await dispatch(
      updateProductStock({
        productId: selectedProduct.id,
        stock: stockValue,
      })
    )

    if (updateProductStock.fulfilled.match(result)) {
      setShowUpdateModal(false)
      setSelectedProduct(null)
      setNewStock('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const closeModal = () => {
    setShowUpdateModal(false)
    setSelectedProduct(null)
    setNewStock('')
    dispatch(clearInventoryError())
  }

  // ── Status map ────────────────────────────────────────────
  const statusMap = {
    in_stock: { bg: '#dcfce7', color: '#34A129', label: t('products.inStock') },
    low_stock: { bg: '#fef9c3', color: '#854d0e', label: t('products.lowStock') },
    out_of_stock: { bg: '#fee2e2', color: '#991b1b', label: t('products.outOfStock') },
  }

  // ── Skeleton Row ──────────────────────────────────────────
  const SkeletonRow = () => (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i}>
          <div className="inv-sk inv-sk-text" />
        </td>
      ))}
    </tr>
  )

  // ─────────────────────────────────────────────────────────
  return (
    <Layout>
      <style>{`
        /* ── Skeleton ── */
        @keyframes inv-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .inv-sk {
          background: linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: inv-shimmer 1.6s infinite;
          border-radius: 6px;
        }
        .inv-sk-text   { height: 14px; width: 80%; }
        .inv-sk-title  { height: 22px; width: 50%; }
        .inv-sk-box    { height: 80px; }

        /* ── Page heading ── */
        .inv-title { 
          font-size:1.5rem; font-weight:700; 
          color:#00204E; margin:0 0 4px; 
        }
        .inv-sub   { font-size:0.875rem; color:#6b7280; margin:0; }

        /* ── Success alert ── */
        .inv-alert {
          display:flex; align-items:center; gap:8px;
          background:#dcfce7; color:#166534;
          border-radius:12px; padding:1rem 1.25rem;
          font-size:0.875rem; font-weight:500;
          margin-bottom:1.5rem;
        }
        .inv-alert-close {
          margin-left:auto; background:none; border:none;
          cursor:pointer; color:#166534; font-size:1.1rem; line-height:1;
        }

        /* ── Error alert ── */
        .inv-error {
          display:flex; align-items:center; gap:8px;
          background:#fee2e2; color:#991b1b;
          border-radius:12px; padding:1rem 1.25rem;
          font-size:0.875rem; font-weight:500;
          margin-bottom:1.5rem;
        }

        /* ── Alert cards (low / out-of-stock) ── */
        .inv-alert-card {
          border-radius:14px !important;
          border:none !important;
          padding:1rem 1.25rem;
        }
        .inv-alert-card.warn {
          background:#fffbeb;
          border-left:4px solid #f59e0b !important;
        }
        .inv-alert-card.danger {
          background:#fef2f2;
          border-left:4px solid #ef4444 !important;
        }
        .inv-alert-card-title {
          font-size:0.875rem; font-weight:600; 
          color:#00204E; margin:0;
        }
        .inv-alert-card-sub {
          font-size:0.775rem; color:#6b7280; margin:4px 0 10px;
        }
        .inv-badge-pill {
          display:inline-block;
          padding:3px 10px; border-radius:20px;
          font-size:0.72rem; font-weight:600;
          margin:2px;
        }

        /* ── Summary stat cards ── */
        .inv-stat-card {
          border:none !important;
          border-radius:14px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          background:#fff;
          transition:transform 0.2s ease, box-shadow 0.2s ease;
          cursor:default;
        }
        .inv-stat-card:hover {
          transform:translateY(-4px);
          box-shadow:0 8px 24px rgba(0,32,78,0.1) !important;
        }
        .inv-stat-val  { 
          font-size:1.75rem; font-weight:800; 
          line-height:1; margin:0 0 4px; 
        }
        .inv-stat-lbl  { font-size:0.8rem; color:#6b7280; margin:0; }

        /* ── Search ── */
        .inv-search-wrap { position:relative; }
        .inv-search-icon {
          position:absolute; left:14px; top:50%;
          transform:translateY(-50%); color:#9ca3af; z-index:1;
          pointer-events:none;
        }
        .inv-search-input {
          width:100%;
          padding:0.625rem 1rem 0.625rem 2.5rem;
          border:1.5px solid #e5e7eb; border-radius:10px;
          font-size:0.875rem; font-family:'Poppins',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .inv-search-input:focus {
          border-color:#34A129;
          box-shadow:0 0 0 3px rgba(52,161,41,0.1);
        }

        /* ── Table card ── */
        .inv-table-card {
          border:none !important;
          border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          overflow:hidden;
        }
        .inv-table { font-size:0.875rem; width:100%; border-collapse:collapse; }
        .inv-table thead tr { background:#fafafa; }
        .inv-table th {
          padding:0.875rem 1rem;
          font-size:0.72rem; font-weight:600;
          text-transform:uppercase; letter-spacing:0.5px;
          color:#9ca3af; border-bottom:1px solid #f3f4f6;
          white-space:nowrap;
        }
        .inv-table td {
          padding:0.875rem 1rem;
          border-bottom:1px solid #f9fafb;
          vertical-align:middle;
        }
        .inv-table tbody tr:last-child td { border-bottom:none; }
        .inv-table tbody tr { transition:background 0.15s; }
        .inv-table tbody tr:hover td { background:#f0f9ff; }

        /* ── Product thumb ── */
        .inv-thumb {
          width:42px; height:42px; border-radius:10px;
          overflow:hidden; background:#f3f4f6; flex-shrink:0;
        }
        .inv-thumb img { width:100%; height:100%; object-fit:cover; }

        /* ── Stock bar ── */
        .inv-stock-bar-wrap {
          height:4px; background:#f3f4f6; border-radius:2px;
          overflow:hidden; width:80px; margin-top:4px;
        }
        .inv-stock-bar { 
          height:100%; border-radius:2px; transition:width 0.3s; 
        }

        /* ── Status chip ── */
        .inv-status-chip {
          display:inline-block;
          padding:3px 10px; border-radius:20px;
          font-size:0.72rem; font-weight:600;
        }

        /* ── Update btn ── */
        .inv-update-btn {
          display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:8px;
          border:1.5px solid #00204E; background:none;
          color:#00204E; font-size:0.8rem; font-weight:600;
          font-family:'Poppins',sans-serif; cursor:pointer;
          transition:all 0.18s;
        }
        .inv-update-btn:hover {
          background:#00204E; color:#fff;
        }
        .inv-update-btn:disabled {
          opacity:0.6; cursor:not-allowed;
        }

        /* ── Spinner ── */
        .inv-spinner {
          display:inline-block; width:14px; height:14px;
          border:2px solid #fff; border-top-color:transparent;
          border-radius:50%; animation:spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Color scheme for stat cards */
        .stat-color-1 { color: #00204E; }
        .stat-color-2 { color: #34A129; }
        .stat-color-3 { color: #f59e0b; }
        .stat-color-4 { color: #ef4444; }

        /* Stock bar colors */
        .stock-good { background: #34A129; }
        .stock-low  { background: #f59e0b; }
        .stock-out  { background: #ef4444; }

        @media (max-width:576px) {
          .inv-stock-bar-wrap { width:55px; }
        }
      `}</style>

      {/* ── Heading ── */}
      <motion.div
        className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="inv-title">{t('inventory.title') || 'Inventory'}</h2>
          <p className="inv-sub">Track and manage your product stock levels</p>
        </div>

        {/* Retry button if fetch failed */}
        {error && (
          <button
            onClick={() => dispatch(fetchInventory())}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
              background: '#00204E', color: '#fff', fontWeight: 600,
              fontFamily: 'Poppins,sans-serif', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        )}
      </motion.div>

      {/* ── Fetch Error ── */}
      {error && (
        <div className="inv-error">
          ⚠️ {error}
        </div>
      )}

      {/* ── Success ── */}
      {success && (
        <motion.div
          className="inv-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅ {t('inventory.stockUpdated') || 'Stock updated successfully!'}
          <button className="inv-alert-close" onClick={() => setSuccess(false)}>×</button>
        </motion.div>
      )}

      {/* ── Alert Cards (low / out-of-stock) ── */}
      {!loading && (lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Row className="g-3 mb-4">
          {lowStockProducts.length > 0 && (
            <Col md={6}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inv-alert-card warn">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaExclamationTriangle color="#f59e0b" size={16} />
                    <p className="inv-alert-card-title">Low Stock Alert</p>
                  </div>
                  <p className="inv-alert-card-sub">
                    {lowStockProducts.length} product(s) running low
                  </p>
                  <div>
                    {lowStockProducts.map((p) => (
                      <span
                        key={p.id}
                        className="inv-badge-pill"
                        style={{ background: '#fef9c3', color: '#854d0e' }}
                      >
                        {p.product_name} ({p.stock} {p.unit})
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Col>
          )}

          {outOfStockProducts.length > 0 && (
            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="inv-alert-card danger">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaExclamationTriangle color="#ef4444" size={16} />
                    <p className="inv-alert-card-title">Out of Stock Alert</p>
                  </div>
                  <p className="inv-alert-card-sub">
                    {outOfStockProducts.length} product(s) out of stock
                  </p>
                  <div>
                    {outOfStockProducts.map((p) => (
                      <span
                        key={p.id}
                        className="inv-badge-pill"
                        style={{ background: '#fee2e2', color: '#991b1b' }}
                      >
                        {p.product_name}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Col>
          )}
        </Row>
      )}

      {/* ── Search ── */}
      <Row className="mb-3">
        <Col md={4}>
          <div className="inv-search-wrap">
            <FaSearch className="inv-search-icon" size={14} />
            <input
              className="inv-search-input"
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      {/* ── Table ── */}
      <div className="inv-table-card card">
        <div className="table-responsive">
          <table className="inv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('inventory.product') || 'Product'}</th>
                <th>Category</th>
                <th>{t('inventory.currentStock') || 'Stock'}</th>
                <th>{t('inventory.status') || 'Status'}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => {
                  const s = statusMap[product.status] || statusMap.in_stock
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      {/* Index */}
                      <td style={{ color: '#9ca3af', fontWeight: 600 }}>{idx + 1}</td>

                      {/* Product */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="inv-thumb">
                            <img
                              src={product.image || '/product-placeholder.png'}
                              alt={product.product_name}
                              onError={(e) => { e.target.src = '/product-placeholder.png' }}
                            />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#00204E', fontSize: '0.875rem' }}>
                              {product.product_name}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                        {product.category_name}
                      </td>

                      {/* Stock + Bar */}
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#00204E' }}>
                          {product.stock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 4 }}>
                          {product.unit}
                        </span>
                        <div className="inv-stock-bar-wrap">
                          <div
                            className={`inv-stock-bar ${product.status === 'in_stock' ? 'stock-good' :
                                product.status === 'low_stock' ? 'stock-low' : 'stock-out'
                              }`}
                            style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status chip */}
                      <td>
                        <span
                          className="inv-status-chip"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          className="inv-update-btn"
                          onClick={() => {
                            setSelectedProduct(product)
                            setNewStock(product.stock)
                            setShowUpdateModal(true)
                          }}
                        >
                          <FaEdit size={11} /> Update Stock
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    <FaBox size={32} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    {t('common.noData') || 'No products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Update Stock Modal ── */}
      <Modal show={showUpdateModal} onHide={closeModal} centered>
        <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700, color: '#00204E' }}>
            {t('inventory.updateStock') || 'Update Stock'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.25rem 1.5rem' }}>
          {selectedProduct && (
            <>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#00204E', margin: '0 0 4px' }}>
                {selectedProduct.product_name}
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 1.25rem' }}>
                Current Stock: {selectedProduct.stock} {selectedProduct.unit}
              </p>

              <label style={{
                fontSize: '0.8125rem', fontWeight: 600,
                color: '#374151', marginBottom: 6, display: 'block',
              }}>
                New Stock Quantity
              </label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                min="0"
                placeholder="Enter new stock quantity"
                style={{
                  width: '100%', padding: '0.625rem 0.875rem',
                  border: '1.5px solid #e5e7eb', borderRadius: 10,
                  fontSize: '0.875rem', fontFamily: 'Poppins,sans-serif',
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#34A129' }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6 }}>
                Low stock: below 10 units · Out of stock: 0 units
              </p>

              {/* Update error inside modal */}
              {updateError && (
                <div style={{
                  marginTop: 8, padding: '0.625rem 0.875rem',
                  background: '#fee2e2', color: '#991b1b',
                  borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500,
                }}>
                  ⚠️ {updateError}
                </div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer style={{ border: 'none', paddingTop: 0 }}>
          <button
            onClick={closeModal}
            disabled={updateLoading}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8,
              border: 'none', background: '#f3f4f6',
              color: '#374151', fontWeight: 600,
              fontFamily: 'Poppins,sans-serif', cursor: 'pointer',
              opacity: updateLoading ? 0.6 : 1,
            }}
          >
            {t('common.cancel') || 'Cancel'}
          </button>

          <button
            onClick={handleUpdateStock}
            disabled={updateLoading || !newStock || isNaN(newStock)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg,#00204E,#34A129)',
              color: '#fff', fontWeight: 600,
              fontFamily: 'Poppins,sans-serif', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: updateLoading ? 0.85 : 1,
            }}
          >
            {updateLoading && <span className="inv-spinner" />}
            {updateLoading ? 'Saving…' : (t('common.save') || 'Save')}
          </button>
        </Modal.Footer>
      </Modal>
    </Layout>
  )
}

export default Inventory