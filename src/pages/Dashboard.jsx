import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaShoppingCart, FaRupeeSign, FaClock, FaStar,
  FaBox, FaClipboardList, FaWarehouse,
  FaArrowUp, FaArrowDown, FaChevronRight,
  FaEllipsisH,
} from 'react-icons/fa'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const { stats, recentOrders, topProducts, salesData } = useSelector((s) => s.dashboard)
  const { user } = useSelector((s) => s.auth)
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status) =>
    ({
      pending:  { color: '#d97706', bg: '#fef3c7' },
      accepted: { color: '#34A129', bg: '#dcfce7' },
      packed:   { color: '#189031', bg: '#bbf7d0' },
      delivered:{ color: '#34A129', bg: '#dcfce7' },
      cancelled:{ color: '#dc2626', bg: '#fee2e2' },
    }[status] || { color: '#6b7280', bg: '#f3f4f6' })

  const statCards = [
    {
      icon: FaShoppingCart,
      title: t('dashboard.todayOrders') || "Today's Orders",
      value: stats?.todayOrders ?? 0,
      change: 12, dir: 'up',
      grad: 'linear-gradient(135deg, #00204E 0%, #34A129 100%)',
      lightBg: '#f0f9ff',
      desc: 'vs yesterday',
    },
    {
      icon: FaRupeeSign,
      title: t('dashboard.todaySales') || "Today's Sales",
      value: `₹${(stats?.todaySales ?? 0).toLocaleString()}`,
      change: 8, dir: 'up',
      grad: 'linear-gradient(135deg, #34A129 0%, #189031 100%)',
      lightBg: '#dcfce7',
      desc: 'vs yesterday',
    },
    {
      icon: FaClock,
      title: t('dashboard.pendingOrders') || 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      change: 5, dir: 'down',
      grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      lightBg: '#fffbeb',
      desc: 'needs attention',
    },
    {
      icon: FaStar,
      title: t('dashboard.customerRating') || 'Customer Rating',
      value: stats?.customerRating ?? '—',
      change: null,
      grad: 'linear-gradient(135deg, #189031 0%, #00204E 100%)',
      lightBg: '#f0f9ff',
      desc: 'out of 5.0',
    },
  ]

  const quickActions = [
    {
      label: t('dashboard.addProduct') || 'Add Product',
      path: '/products',
      solid: true,
      Icon: FaBox,
      desc: 'Add new items',
    },
    {
      label: t('dashboard.viewOrders') || 'View Orders',
      path: '/orders',
      solid: false,
      Icon: FaClipboardList,
      desc: 'Manage orders',
    },
    {
      label: t('dashboard.manageInventory') || 'Inventory',
      path: '/inventory',
      solid: false,
      Icon: FaWarehouse,
      desc: 'Check stock',
    },
  ]

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '10px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          fontFamily: 'Poppins, sans-serif',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
            {label}
          </p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#34A129' }}>
            ₹{payload[0].value?.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Layout>
      <style>{`
        /* ── Animations ── */
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* ── Skeleton ── */
        .sk {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e4e4e4 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
          border-radius: 8px;
        }

        /* ════════════════════════════════
           GREETING
        ════════════════════════════════ */
        .dash-greeting-wrap {
          margin-bottom: 1.75rem;
        }
        .dash-greeting-name {
          font-size: 1.625rem;
          font-weight: 700;
          color: #00204E;
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .dash-greeting-sub {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }
        .dash-date-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #00204E;
          font-weight: 500;
          box-shadow: 0 1px 4px rgba(0,32,78,0.05);
          white-space: nowrap;
        }

        /* ════════════════════════════════
           STAT CARDS
        ════════════════════════════════ */
        .stat-card-wrap {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.08) !important;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          overflow: hidden;
          height: 100%;
          background: #fff;
        }
        .stat-card-wrap:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0,32,78,0.12) !important;
        }
        .stat-icon-box {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-size: 1.125rem;
          flex-shrink: 0;
        }
        .stat-val {
          font-size: 1.75rem;
          font-weight: 800;
          color: #00204E;
          line-height: 1;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .stat-lbl {
          font-size: 0.8125rem;
          color: #6b7280;
          font-weight: 500;
          margin: 0 0 10px;
        }
        .stat-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px solid #f3f4f6;
          margin-top: 2px;
        }
        .stat-chg {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .chg-up   { background: #dcfce7; color: #34A129; }
        .chg-down { background: #fee2e2; color: #dc2626; }
        .stat-desc {
          font-size: 0.72rem;
          color: #9ca3af;
          font-weight: 500;
        }
        .stat-bar {
          height: 4px;
          border-radius: 2px;
          margin-top: 10px;
          opacity: 0.18;
        }

        /* ════════════════════════════════
           QUICK ACTIONS
        ════════════════════════════════ */
        .qa-card {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.06) !important;
          background: #fff;
          margin-bottom: 1.5rem;
        }
        .qa-card-head {
          padding: 1.125rem 1.25rem 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #00204E;
        }
        .qa-btn-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1rem 1.25rem 1.125rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          border: none;
          width: 100%;
        }
        .qa-solid-btn {
          background: linear-gradient(135deg, #00204E, #34A129);
          box-shadow: 0 4px 14px rgba(0,32,78,0.35);
          color: #fff;
        }
        .qa-solid-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,32,78,0.4);
        }
        .qa-outline-btn {
          background: #f9fafb;
          border: 1.5px solid #e5e7eb !important;
          color: #374151;
        }
        .qa-outline-btn:hover {
          background: #f0f9ff;
          border-color: #34A129 !important;
          color: #00204E;
        }
        .qa-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }
        .qa-solid-btn .qa-icon-wrap { background: rgba(255,255,255,0.2); color: #fff; }
        .qa-outline-btn .qa-icon-wrap { background: #dcfce7; color: #34A129; }
        .qa-outline-btn:hover .qa-icon-wrap { background: #bbf7d0; }
        .qa-text-main {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.2;
          margin: 0 0 2px;
        }
        .qa-text-sub {
          font-size: 0.72rem;
          opacity: 0.75;
          margin: 0;
          line-height: 1;
        }
        .qa-arrow {
          margin-left: auto;
          opacity: 0.5;
          flex-shrink: 0;
        }

        /* ════════════════════════════════
           SECTION CARDS (Chart / Orders)
        ════════════════════════════════ */
        .sec-card-v2 {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.06) !important;
          background: #fff;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .sec-head-v2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.125rem 1.25rem;
          border-bottom: 1px solid #f3f4f6;
          flex-shrink: 0;
        }
        .sec-title-v2 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #00204E;
          margin: 0;
        }
        .sec-link-v2 {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: #34A129;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .sec-link-v2:hover { background: #dcfce7; }

        /* ════════════════════════════════
           RECENT ORDERS
        ════════════════════════════════ */
        .ord-list { padding: 0.75rem; flex: 1; overflow-y: auto; }
        .ord-row {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 4px;
        }
        .ord-row:last-child { margin-bottom: 0; }
        .ord-row:hover { background: #f0f9ff; }
        .ord-avatar {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #34A129;
        }
        .ord-info { flex: 1; min-width: 0; }
        .ord-num-v2 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #00204E;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ord-meta-v2 {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ord-right { text-align: right; flex-shrink: 0; }
        .ord-amt-v2 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #00204E;
          margin: 0 0 5px;
        }
        .ord-status-chip {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: capitalize;
          letter-spacing: 0.2px;
        }

        /* ════════════════════════════════
           TOP PRODUCTS TABLE
        ════════════════════════════════ */
        .tp-card {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.06) !important;
          background: #fff;
          overflow: hidden;
          margin-top: 1.5rem;
        }
        .tp-tbl { width: 100%; border-collapse: collapse; }
        .tp-tbl thead tr {
          background: #fafafa;
        }
        .tp-tbl th {
          padding: 0.875rem 1.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #9ca3af;
          border-bottom: 1px solid #f3f4f6;
          white-space: nowrap;
        }
        .tp-tbl td {
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          color: #374151;
          border-bottom: 1px solid #f9fafb;
          vertical-align: middle;
        }
        .tp-tbl tbody tr:last-child td { border-bottom: none; }
        .tp-tbl tbody tr {
          transition: background 0.15s;
        }
        .tp-tbl tbody tr:hover td { background: #f0f9ff; }
        .tp-rank-badge {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700;
          flex-shrink: 0;
        }
        .rank-1 { background: linear-gradient(135deg,#34A129,#189031); color: #fff; }
        .rank-2 { background: linear-gradient(135deg,#00204E,#1e40af); color: #fff; }
        .rank-3 { background: linear-gradient(135deg,#94a3b8,#64748b); color: #fff; }
        .rank-n { background: #f3f4f6; color: #6b7280; }
        .tp-bar-wrap {
          width: 80px;
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
          display: inline-block;
        }
        .tp-bar-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #34A129, #189031);
        }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */
        @media (max-width: 767px) {
          .dash-greeting-name { font-size: 1.375rem; }
          .stat-val { font-size: 1.5rem; }
          .tp-bar-wrap { display: none; }
          .tp-tbl th, .tp-tbl td { padding: 0.75rem 1rem; }
        }
        @media (max-width: 480px) {
          .dash-greeting-name { font-size: 1.2rem; }
          .stat-val { font-size: 1.25rem; }
          .stat-icon-box { width: 40px; height: 40px; font-size: 1rem; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          GREETING ROW
      ══════════════════════════════════════ */}
      <motion.div
        className="dash-greeting-wrap"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="dash-greeting-name">
              {t('dashboard.welcome') || 'Welcome back'},{' '}
              {user?.name || 'John Doe'}! 👋
            </h2>
            <p className="dash-greeting-sub">
              Here's what's happening with your store today.
            </p>
          </div>
          <span className="dash-date-chip">
            📅{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          STAT CARDS
      ══════════════════════════════════════ */}
      <Row className="g-3 mb-4">
        {statCards.map((c, i) => (
          <Col xs={12} sm={6} xl={3} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              style={{ height: '100%' }}
            >
              <Card className="stat-card-wrap">
                <Card.Body className="p-3 p-md-4">
                  {loading ? (
                    <div>
                      <div className="d-flex justify-content-between mb-3">
                        <div className="sk" style={{ width: 48, height: 48, borderRadius: 14 }} />
                        <div className="sk" style={{ width: 52, height: 22, borderRadius: 6 }} />
                      </div>
                      <div className="sk mb-2" style={{ height: 32, width: '60%' }} />
                      <div className="sk mb-3" style={{ height: 14, width: '75%' }} />
                      <div className="sk" style={{ height: 4, borderRadius: 2 }} />
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div
                          className="stat-icon-box"
                          style={{ background: c.grad }}
                        >
                          <c.icon />
                        </div>
                        {c.change && (
                          <span className={`stat-chg ${c.dir === 'up' ? 'chg-up' : 'chg-down'}`}>
                            {c.dir === 'up'
                              ? <FaArrowUp size={8} />
                              : <FaArrowDown size={8} />
                            }
                            {c.change}%
                          </span>
                        )}
                      </div>

                      <p className="stat-val">{c.value}</p>
                      <p className="stat-lbl">{c.title}</p>

                      <div className="stat-footer">
                        {c.change ? (
                          <span className={`stat-chg ${c.dir === 'up' ? 'chg-up' : 'chg-down'}`}>
                            {c.dir === 'up'
                              ? <FaArrowUp size={7} />
                              : <FaArrowDown size={7} />
                            }
                            {c.change}%
                          </span>
                        ) : null}
                        <span className="stat-desc">{c.desc}</span>
                      </div>

                      {/* Colored bar at bottom */}
                      <div
                        className="stat-bar"
                        style={{ background: c.grad }}
                      />
                    </>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ══════════════════════════════════════
          QUICK ACTIONS
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.32 }}
      >
        <Card className="qa-card">
          <div className="qa-card-head">
            ⚡ Quick Actions
          </div>
          <Card.Body className="p-3">
            <Row className="g-2">
              {quickActions.map(({ label, path, solid, Icon, desc }, i) => (
                <Col xs={12} sm={4} key={i}>
                  <button
                    className={`qa-btn-wrap ${solid ? 'qa-solid-btn' : 'qa-outline-btn'}`}
                    onClick={() => navigate(path)}
                  >
                    <div className="qa-icon-wrap">
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="qa-text-main">{label}</p>
                      <p className="qa-text-sub">{desc}</p>
                    </div>
                    <FaChevronRight size={11} className="qa-arrow" />
                  </button>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      {/* ══════════════════════════════════════
          CHART + RECENT ORDERS
      ══════════════════════════════════════ */}
      <Row className="g-3 mb-0">

        {/* Sales Area Chart */}
        <Col xs={12} lg={7} xl={8}>
          <motion.div
            style={{ height: '100%' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
          >
            <Card className="sec-card-v2">
              <div className="sec-head-v2">
                <div>
                  <h5 className="sec-title-v2">
                    {t('dashboard.salesOverview') || 'Sales Overview'}
                  </h5>
                  <p style={{
                    fontSize: '0.78rem', color: '#9ca3af',
                    margin: '2px 0 0', fontWeight: 500,
                  }}>
                    Last 7 days performance
                  </p>
                </div>
                <div style={{
                  background: '#f0f9ff',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#00204E',
                }}>
                  This Week
                </div>
              </div>
              <Card.Body className="p-3">
                {loading ? (
                  <div className="sk" style={{ height: 280 }} />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={salesData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#34A129" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00204E" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f3f4f6"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="transparent"
                        tick={{
                          fontSize: 11,
                          fontFamily: 'Poppins',
                          fill: '#9ca3af',
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="transparent"
                        tick={{
                          fontSize: 11,
                          fontFamily: 'Poppins',
                          fill: '#9ca3af',
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#34A129"
                        strokeWidth={2.5}
                        fill="url(#salesGrad)"
                        dot={{ fill: '#34A129', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: '#34A129', strokeWidth: 2, fill: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Recent Orders */}
        <Col xs={12} lg={5} xl={4}>
          <motion.div
            style={{ height: '100%' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.48 }}
          >
            <Card className="sec-card-v2">
              <div className="sec-head-v2">
                <h5 className="sec-title-v2">
                  {t('dashboard.recentOrders') || 'Recent Orders'}
                </h5>
                <button
                  className="sec-link-v2"
                  onClick={() => navigate('/orders')}
                >
                  View All <FaChevronRight size={9} />
                </button>
              </div>

              <div className="ord-list">
                {loading
                  ? [1, 2, 3, 4].map((i) => (
                      <div key={i} className="ord-row">
                        <div className="sk" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="sk mb-1" style={{ height: 14, width: '70%' }} />
                          <div className="sk"      style={{ height: 11, width: '50%' }} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="sk mb-1" style={{ height: 16, width: 56 }} />
                          <div className="sk"      style={{ height: 18, width: 52 }} />
                        </div>
                      </div>
                    ))
                  : recentOrders.map((o) => {
                      const sc = getStatusColor(o.status)
                      // Avatar initials from customer name
                      const initials = (o.customerName || 'U')
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                      return (
                        <div
                          key={o.id}
                          className="ord-row"
                          onClick={() => navigate('/orders')}
                        >
                          <div className="ord-avatar">{initials}</div>
                          <div className="ord-info">
                            <p className="ord-num-v2">{o.orderNumber}</p>
                            <p className="ord-meta-v2">
                              {o.customerName} · {o.items} items · {o.time}
                            </p>
                          </div>
                          <div className="ord-right">
                            <p className="ord-amt-v2">₹{o.amount}</p>
                            <span
                              className="ord-status-chip"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              {o.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* ══════════════════════════════════════
          TOP PRODUCTS
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.56 }}
      >
        <Card className="tp-card">
          <div className="sec-head-v2">
            <div>
              <h5 className="sec-title-v2">
                {t('dashboard.topProducts') || 'Top Products'}
              </h5>
              <p style={{
                fontSize: '0.78rem', color: '#9ca3af',
                margin: '2px 0 0', fontWeight: 500,
              }}>
                Best performing this week
              </p>
            </div>
            <button
              className="sec-link-v2"
              onClick={() => navigate('/products')}
            >
              See All <FaChevronRight size={9} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="tp-tbl">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Units Sold</th>
                  <th style={{ textAlign: 'right', display: 'none' }}
                      className="d-none d-md-table-cell">
                    Progress
                  </th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1, 2, 3, 4].map((i) => (
                      <tr key={i}>
                        <td><div className="sk" style={{ width: 28, height: 28, borderRadius: 8 }} /></td>
                        <td><div className="sk" style={{ height: 15, width: '70%' }} /></td>
                        <td><div className="sk" style={{ height: 15, width: 48, margin: 'auto' }} /></td>
                        <td className="d-none d-md-table-cell">
                          <div className="sk" style={{ height: 6, width: 80, marginLeft: 'auto' }} />
                        </td>
                        <td><div className="sk" style={{ height: 15, width: 60, marginLeft: 'auto' }} /></td>
                      </tr>
                    ))
                  : (() => {
                      const maxRev = Math.max(...topProducts.map((p) => p.revenue ?? 0), 1)
                      return topProducts.map((p, idx) => (
                        <tr key={p.id}>
                          <td>
                            <div className={`tp-rank-badge ${
                              idx === 0 ? 'rank-1'
                              : idx === 1 ? 'rank-2'
                              : idx === 2 ? 'rank-3'
                              : 'rank-n'
                            }`}>
                              {idx + 1}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#00204E', marginBottom: 2 }}>
                              {p.name}
                            </div>
                            {p.category && (
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                {p.category}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: '#f3f4f6',
                              padding: '3px 12px',
                              borderRadius: 20,
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              color: '#374151',
                            }}>
                              {p.sold}
                            </span>
                          </td>
                          <td className="d-none d-md-table-cell" style={{ textAlign: 'right' }}>
                            <div className="tp-bar-wrap">
                              <div
                                className="tp-bar-fill"
                                style={{ width: `${((p.revenue ?? 0) / maxRev) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 700,
                              color: '#34A129',
                              fontSize: '0.9375rem',
                            }}>
                              ₹{(p.revenue ?? 0).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    })()}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

    </Layout>
  )
}

export default Dashboard