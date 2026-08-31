import { useState, useEffect } from 'react'
import { Row, Col, Card, Modal } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  FaSearch, FaPhone, FaEnvelope,
  FaShoppingBag, FaStar, FaUser,
} from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'
import CustomerDetail from './CustomerDetail'
import { fetchCustomers } from '../redux/customerSlice'

const Customers = () => {
  const dispatch                          = useDispatch()
  const [searchTerm, setSearchTerm]       = useState('')
  const [filterType, setFilterType]       = useState('all')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const { customers, loading } = useSelector((state) => state.customer)
  const { t }         = useLanguage()

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm)
    const matchFilter = filterType === 'all' || (filterType === 'repeat' && c.isRepeat)
    return matchSearch && matchFilter
  })

  const totalSpent  = customers.reduce((a, c) => a + c.totalSpent,  0)
  const totalOrders = customers.reduce((a, c) => a + c.totalOrders, 0)

  return (
    <Layout>
      <style>{`
        @keyframes cust-shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        .cust-sk {
          background:linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size:200% 100%;
          animation:cust-shimmer 1.6s infinite;
          border-radius:6px;
        }
        .cust-sk-text  { height:14px; }
        .cust-sk-title { height:22px; }

        /* heading */
        .cust-title { 
          font-size:1.5rem; font-weight:700; 
          color:#00204E; margin:0 0 4px; 
        }
        .cust-sub   { font-size:0.875rem; color:#6b7280; margin:0; }

        /* stat cards */
        .cust-stat-card {
          border:none !important; border-radius:14px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          background:#fff; text-align:center;
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .cust-stat-card:hover {
          transform:translateY(-4px);
          box-shadow:0 8px 24px rgba(0,32,78,0.1) !important;
        }
        .cust-stat-val { 
          font-size:1.5rem; font-weight:800; 
          line-height:1; margin:0 0 4px; 
        }
        .cust-stat-lbl { font-size:0.775rem; color:#6b7280; margin:0; }

        /* search */
        .cust-search-wrap { position:relative; }
        .cust-search-icon {
          position:absolute; left:14px; top:50%;
          transform:translateY(-50%); color:#9ca3af; z-index:1; pointer-events:none;
        }
        .cust-search-input {
          width:100%; padding:0.625rem 1rem 0.625rem 2.5rem;
          border:1.5px solid #e5e7eb; border-radius:10px;
          font-size:0.875rem; font-family:'Poppins',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cust-search-input:focus {
          border-color:#34A129; 
          box-shadow:0 0 0 3px rgba(52,161,41,0.1);
        }
        .cust-filter-select {
          width:100%; padding:0.625rem 1rem;
          border:1.5px solid #e5e7eb; border-radius:10px;
          font-size:0.875rem; font-family:'Poppins',sans-serif;
          outline:none; background:#fff; cursor:pointer;
          transition:border-color 0.2s;
        }
        .cust-filter-select:focus { border-color:#34A129; }

        /* customer card */
        .cust-card {
          border:1.5px solid #e5e7eb !important;
          border-radius:16px !important;
          box-shadow:0 2px 8px rgba(0,32,78,0.05) !important;
          background:#fff; margin-bottom:1rem;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cust-card:hover {
          border-color:#34A129 !important;
          box-shadow:0 4px 16px rgba(52,161,41,0.12) !important;
        }

        /* avatar */
        .cust-avatar {
          width:48px; height:48px; border-radius:50%;
          background:linear-gradient(135deg,#00204E,#34A129);
          color:#fff; display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:1.125rem; flex-shrink:0;
        }

        /* repeat badge */
        .cust-repeat-badge {
          display:inline-flex; align-items:center; gap:3px;
          padding:2px 8px; border-radius:20px;
          background:#dcfce7; color:#34A129;
          font-size:0.7rem; font-weight:600;
        }

        /* mini stats inside card */
        .cust-mini-stat { text-align:center; }
        .cust-mini-val  { 
          font-size:1.1rem; font-weight:700; 
          color:#00204E; line-height:1.2; margin:2px 0; 
        }
        .cust-mini-lbl  { font-size:0.72rem; color:#9ca3af; margin:0; }

        /* view btn */
        .cust-view-btn {
          padding:5px 14px; border-radius:8px;
          border:1.5px solid #00204E; background:none; color:#00204E;
          font-size:0.8rem; font-weight:600;
          font-family:'Poppins',sans-serif; cursor:pointer;
          transition:all 0.18s;
        }
        .cust-view-btn:hover { background:#00204E; color:#fff; }

        /* empty */
        .cust-empty { text-align:center; padding:3rem; color:#9ca3af; }

        /* stat colors */
        .stat-color-1 { color: #00204E; }
        .stat-color-2 { color: #34A129; }
        .stat-color-3 { color: #189031; }
        .stat-color-4 { color: #f59e0b; }

        @media (max-width:576px) {
          .cust-avatar { width:38px; height:38px; font-size:0.9rem; }
        }
      `}</style>

      {/* ── Heading ── */}
      <motion.div
        className="mb-4"
        initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4 }}
      >
        <h2 className="cust-title">{t('customers.title') || 'Customers'}</h2>
        <p className="cust-sub">View and manage your customer base</p>
      </motion.div>

      {/* ── Stats ── */}
      <Row className="g-3 mb-4">
        {[
          { label:'Total Customers',  value: customers.length,                            colorClass:'stat-color-1' },
          { label:t('customers.repeatCustomers') || 'Repeat',
            value: customers.filter((c)=>c.isRepeat).length,                              colorClass:'stat-color-2' },
          { label:'Total Revenue',    value:`₹${totalSpent.toLocaleString()}`,            colorClass:'stat-color-3' },
          { label:'Avg Order Value',  value:`₹${totalOrders ? Math.round(totalSpent/totalOrders) : 0}`,
                                                                                           colorClass:'stat-color-4' },
        ].map((item, i) => (
          <Col xs={6} md={3} key={i}>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.08 }}>
              <Card className="cust-stat-card">
                <Card.Body className="p-3">
                  {loading ? (
                    <>
                      <div className="cust-sk cust-sk-title mx-auto mb-2" style={{ width:'55%' }} />
                      <div className="cust-sk cust-sk-text  mx-auto" style={{ width:'75%' }} />
                    </>
                  ) : (
                    <>
                      <p className={`cust-stat-val ${item.colorClass}`}>{item.value}</p>
                      <p className="cust-stat-lbl">{item.label}</p>
                    </>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ── Filters ── */}
      <Row className="g-3 mb-4">
        <Col md={5} lg={4}>
          <div className="cust-search-wrap">
            <FaSearch className="cust-search-icon" size={13} />
            <input
              className="cust-search-input"
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col md={3} lg={2}>
          <select className="cust-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Customers</option>
            <option value="repeat">Repeat Only</option>
          </select>
        </Col>
      </Row>

      {/* ── List ── */}
      {loading ? (
        [1,2,3,4].map((i) => (
          <div key={i} className="cust-card card" style={{ padding:'1.25rem', marginBottom:'1rem' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="cust-sk" style={{ width:48, height:48, borderRadius:'50%', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div className="cust-sk cust-sk-title mb-2" style={{ width:'50%' }} />
                <div className="cust-sk cust-sk-text"  style={{ width:'70%' }} />
              </div>
            </div>
          </div>
        ))
      ) : filteredCustomers.length === 0 ? (
        <div className="cust-empty">
          <FaUser size={36} style={{ marginBottom:10 }} />
          <p style={{ margin:0 }}>{t('common.noData') || 'No customers found'}</p>
        </div>
      ) : (
        filteredCustomers.map((customer) => (
          <motion.div key={customer.id} className="cust-card card"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div style={{ padding:'1rem 1.25rem' }}>
              <Row className="align-items-center g-2">

                {/* info */}
                <Col xs={12} md={6}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="cust-avatar">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'#00204E' }}>
                          {customer.name}
                        </span>
                        {customer.isRepeat && (
                          <span className="cust-repeat-badge">
                            <FaStar size={9} /> Repeat
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-3 mt-1 flex-wrap">
                        <span style={{ fontSize:'0.75rem', color:'#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                          <FaPhone size={9} /> {customer.mobile}
                        </span>
                        <span style={{ fontSize:'0.75rem', color:'#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                          <FaEnvelope size={9} /> {customer.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* mini stats */}
                <Col xs={12} md={4}>
                  <Row>
                    <Col xs={6}>
                      <div className="cust-mini-stat">
                        <FaShoppingBag color="#00204E" size={14} />
                        <p className="cust-mini-val">{customer.totalOrders}</p>
                        <p className="cust-mini-lbl">Orders</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="cust-mini-stat">
                        <span style={{ color:'#34A129', fontSize:'1rem', fontWeight:700 }}>₹</span>
                        <p className="cust-mini-val">
                          {(customer.totalSpent / 1000).toFixed(1)}k
                        </p>
                        <p className="cust-mini-lbl">Spent</p>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* view btn */}
                <Col xs={12} md={2} className="text-md-end">
                  <button className="cust-view-btn"
                    onClick={() => { setSelectedCustomer(customer); setShowDetailModal(true) }}>
                    View Details
                  </button>
                </Col>
              </Row>
            </div>
          </motion.div>
        ))
      )}

      {/* ── Detail Modal ── */}
      <Modal show={showDetailModal}
        onHide={() => { setShowDetailModal(false); setSelectedCustomer(null) }}
        size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize:'1rem', fontWeight:700, color:'#00204E' }}>
            {t('customers.customerDetails') || 'Customer Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CustomerDetail customer={selectedCustomer} />
        </Modal.Body>
      </Modal>
    </Layout>
  )
}

export default Customers