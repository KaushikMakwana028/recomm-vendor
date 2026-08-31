import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { fetchReport } from '../redux/reportSlice'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { FaDownload, FaChartBar, FaShoppingCart, FaRupeeSign } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import Layout from '../components/Layout'

const COLORS = ['#00204E','#34A129','#189031','#f59e0b','#8b5cf6']

const dailyData   = [
  { time:'8 AM',  orders:3,  sales:850  },
  { time:'10 AM', orders:8,  sales:2400 },
  { time:'12 PM', orders:12, sales:3600 },
  { time:'2 PM',  orders:6,  sales:1800 },
  { time:'4 PM',  orders:10, sales:2900 },
  { time:'6 PM',  orders:15, sales:4500 },
  { time:'8 PM',  orders:9,  sales:2700 },
]
const weeklyData  = [
  { day:'Mon', orders:25, sales:7500  },
  { day:'Tue', orders:32, sales:9600  },
  { day:'Wed', orders:28, sales:8400  },
  { day:'Thu', orders:45, sales:13500 },
  { day:'Fri', orders:52, sales:15600 },
  { day:'Sat', orders:60, sales:18000 },
  { day:'Sun', orders:38, sales:11400 },
]
const monthlyData = [
  { month:'Aug', orders:320, sales:96000  },
  { month:'Sep', orders:380, sales:114000 },
  { month:'Oct', orders:420, sales:126000 },
  { month:'Nov', orders:510, sales:153000 },
  { month:'Dec', orders:620, sales:186000 },
  { month:'Jan', orders:480, sales:144000 },
]
const topProducts = [
  { name:'Milk (1L)',    sold:850,  revenue:42500  },
  { name:'Rice (5kg)',   sold:420,  revenue:176400 },
  { name:'Bread',        sold:1200, revenue:36000  },
  { name:'Eggs (12pcs)', sold:650,  revenue:44200  },
  { name:'Sugar (1kg)',  sold:380,  revenue:19000  },
]
const categoryData = [
  { name:'Dairy',      value:35 },
  { name:'Grains',     value:25 },
  { name:'Bakery',     value:20 },
  { name:'Beverages',  value:12 },
  { name:'Others',     value:8  },
]
const summaryStats = {
  daily:   { orders:63,   sales:18750,  avgOrder:297 },
  weekly:  { orders:280,  sales:84000,  avgOrder:300 },
  monthly: { orders:1120, sales:336000, avgOrder:300 },
}

const Reports = () => {
  const dispatch                  = useDispatch()
  const [activeTab, setActiveTab] = useState('daily')
  const { t }                     = useLanguage()

  const { reportData, loading } = useSelector((state) => state.report)

  useEffect(() => {
    dispatch(fetchReport(activeTab))
  }, [dispatch, activeTab])

  const xKey = activeTab === 'daily' ? 'time'
             : activeTab === 'weekly' ? 'day' : 'month'

  const metrics = reportData?.metrics || { total_orders: 0, total_sales: 0, avg_order_value: 0 }
  
  const current = {
    orders: metrics.total_orders,
    sales: metrics.total_sales,
    avgOrder: metrics.avg_order_value
  }

  const salesReport = reportData?.sales_report || { labels: [], values: [] }
  const chartData = (salesReport.labels || []).map((label, idx) => ({
    [xKey]: label,
    sales: salesReport.values[idx] || 0,
    orders: 0
  }))

  const categoryDistribution = reportData?.category_distribution || []
  const categoryData = categoryDistribution.map(item => ({
    name: item.category,
    value: item.sales
  }))

  const topProducts = (reportData?.top_selling_products || []).map(p => ({
    name: p.product,
    sold: p.units_sold,
    revenue: p.revenue,
    performance: p.performance
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background:'#fff', borderRadius:10, padding:'10px 16px',
        boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
        fontFamily:'Poppins,sans-serif', fontSize:12,
      }}>
        <p style={{ color:'#9ca3af', margin:'0 0 4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin:0, fontWeight:700, color: i === 0 ? '#00204E' : '#34A129' }}>
            {p.name === 'sales' ? `₹${p.value?.toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <style>{`
        @keyframes rep-shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        .rep-sk {
          background:linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size:200% 100%;
          animation:rep-shimmer 1.6s infinite; border-radius:6px;
        }
        .rep-sk-text   { height:14px; }
        .rep-sk-title  { height:22px; }
        .rep-sk-chart  { height:300px; }
        .rep-sk-avatar { width:52px; height:52px; border-radius:12px; flex-shrink:0; }

        /* heading */
        .rep-title { 
          font-size:1.5rem; font-weight:700; 
          color:#00204E; margin:0 0 4px; 
        }
        .rep-sub   { font-size:0.875rem; color:#6b7280; margin:0; }

        /* download btn */
        .rep-dl-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:0.6rem 1.375rem; border-radius:10px;
          border:1.5px solid #00204E; background:none; color:#00204E;
          font-size:0.875rem; font-weight:600;
          font-family:'Poppins',sans-serif; cursor:pointer;
          transition:all 0.2s;
        }
        .rep-dl-btn:hover { background:#00204E; color:#fff; }

        /* period tabs */
        .rep-tabs {
          display:flex; background:#fff; border-radius:12px;
          padding:5px; box-shadow:0 2px 8px rgba(0,32,78,0.06);
          width:fit-content; gap:4px;
        }
        .rep-tab {
          padding:0.5rem 1.375rem; border:none; background:none;
          border-radius:9px; font-family:'Poppins',sans-serif;
          font-weight:500; font-size:0.875rem; color:#6b7280;
          cursor:pointer; transition:all 0.2s;
        }
        .rep-tab.active {
          background:linear-gradient(135deg,#00204E,#34A129);
          color:#fff; box-shadow:0 4px 12px rgba(0,32,78,0.3);
        }

        /* stat card */
        .rep-stat-card {
          border:none !important; border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          background:#fff;
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .rep-stat-card:hover {
          transform:translateY(-4px);
          box-shadow:0 8px 24px rgba(0,32,78,0.1) !important;
        }
        .rep-stat-icon {
          width:52px; height:52px; border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-size:1.25rem; flex-shrink:0;
        }
        .rep-stat-val { 
          font-size:1.5rem; font-weight:800; 
          color:#00204E; margin:0 0 4px; 
        }
        .rep-stat-lbl { font-size:0.8rem; color:#6b7280; margin:0; }

        /* chart card */
        .rep-chart-card {
          border:none !important; border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          background:#fff; overflow:hidden; height:100%;
        }
        .rep-chart-head {
          padding:1.125rem 1.375rem; border-bottom:1px solid #f3f4f6;
          font-size:0.9375rem; font-weight:600; color:#00204E;
        }
        .rep-chart-body { padding:1.25rem; }

        /* top products table */
        .rep-tp-card {
          border:none !important; border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.06) !important;
          overflow:hidden; background:#fff;
        }
        .rep-tp-tbl { width:100%; border-collapse:collapse; }
        .rep-tp-tbl th {
          padding:0.875rem 1.25rem; font-size:0.72rem;
          font-weight:600; text-transform:uppercase; letter-spacing:0.5px;
          color:#9ca3af; border-bottom:1px solid #f3f4f6; background:#fafafa;
        }
        .rep-tp-tbl td {
          padding:0.875rem 1.25rem; font-size:0.875rem;
          color:#374151; border-bottom:1px solid #f9fafb; vertical-align:middle;
        }
        .rep-tp-tbl tbody tr:last-child td { border-bottom:none; }
        .rep-tp-tbl tbody tr:hover td     { background:#f0f9ff; }
        .rep-rank {
          width:30px; height:30px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg,#00204E,#34A129);
          color:#fff; font-weight:700; font-size:0.8rem;
        }
        .rep-perf-wrap {
          height:8px; background:#f3f4f6; border-radius:4px;
          overflow:hidden; min-width:80px;
        }
        .rep-perf-bar {
          height:100%; border-radius:4px;
          background:linear-gradient(90deg,#34A129,#189031);
          transition:width 0.5s ease;
        }

        /* gradient variations for stat cards */
        .grad-1 { background:linear-gradient(135deg,#00204E,#34A129); }
        .grad-2 { background:linear-gradient(135deg,#34A129,#189031); }
        .grad-3 { background:linear-gradient(135deg,#189031,#00204E); }

        @media (max-width:768px) {
          .rep-tab { padding:0.5rem 1rem; font-size:0.8rem; }
          .rep-perf-wrap { display:none; }
        }
      `}</style>

      {/* ── Heading ── */}
      <motion.div
        className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4"
        initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4 }}
      >
        <div>
          <h2 className="rep-title">{t('reports.title') || 'Reports'}</h2>
          <p className="rep-sub">Detailed analytics and insights</p>
        </div>
        <button className="rep-dl-btn">
          <FaDownload size={13} />
          {t('reports.downloadReport') || 'Download Report'}
        </button>
      </motion.div>

      {/* ── Period Tabs ── */}
      <div className="mb-4">
        <div className="rep-tabs">
          {['daily','weekly','monthly'].map((tab) => (
            <button key={tab}
              className={`rep-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {t(`reports.${tab}`) || tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <Row className="g-3 mb-4">
        {[
          { icon:FaShoppingCart, label:t('reports.totalOrders')||'Total Orders',
            value:current.orders,                         gradClass:'grad-1' },
          { icon:FaRupeeSign,    label:t('reports.totalSales')||'Total Sales',
            value:`₹${current.sales.toLocaleString()}`,   gradClass:'grad-2' },
          { icon:FaChartBar,     label:'Avg. Order Value',
            value:`₹${current.avgOrder}`,                 gradClass:'grad-3' },
        ].map((item, i) => (
          <Col xs={12} md={4} key={i}>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.08 }}>
              <Card className="rep-stat-card">
                <Card.Body className="p-4">
                  {loading ? (
                    <div className="d-flex align-items-center gap-3">
                      <div className="rep-sk rep-sk-avatar" />
                      <div style={{ flex:1 }}>
                        <div className="rep-sk rep-sk-title mb-2" style={{ width:'60%' }} />
                        <div className="rep-sk rep-sk-text"  style={{ width:'80%' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rep-stat-icon ${item.gradClass}`}>
                        <item.icon />
                      </div>
                      <div>
                        <p className="rep-stat-val">{item.value}</p>
                        <p className="rep-stat-lbl">{item.label}</p>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ── Charts ── */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <div className="rep-chart-card">
            <div className="rep-chart-head">
              {t('reports.salesReport') || 'Sales Report'}
            </div>
            <div className="rep-chart-body">
              {loading ? (
                <div className="rep-sk rep-sk-chart" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top:5, right:5, left:-15, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey={xKey} stroke="transparent"
                      tick={{ fontSize:11, fontFamily:'Poppins', fill:'#9ca3af' }}
                      axisLine={false} tickLine={false} />
                    <YAxis stroke="transparent"
                      tick={{ fontSize:11, fontFamily:'Poppins', fill:'#9ca3af' }}
                      axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sales"  fill="#00204E" radius={[6,6,0,0]} />
                    <Bar dataKey="orders" fill="#34A129" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Col>
        <Col lg={4}>
          <div className="rep-chart-card">
            <div className="rep-chart-head">Category Distribution</div>
            <div className="rep-chart-body">
              {loading ? (
                <div className="rep-sk rep-sk-chart" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={5} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Top Products ── */}
      <div className="rep-tp-card">
        <div className="rep-chart-head">
          {t('reports.topProducts') || 'Top Products'}
        </div>
        <div className="table-responsive">
          <table className="rep-tp-tbl">
            <thead>
              <tr>
                <th style={{ width:48 }}>Rank</th>
                <th>Product</th>
                <th style={{ textAlign:'center' }}>Units Sold</th>
                <th style={{ textAlign:'right' }}>Revenue</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map((i) => (
                    <tr key={i}>
                      {[1,2,3,4,5].map((j) => (
                        <td key={j}><div className="rep-sk rep-sk-text" /></td>
                      ))}
                    </tr>
                  ))
                : topProducts.map((p, i) => (
                    <tr key={i}>
                      <td><div className="rep-rank">{i+1}</div></td>
                      <td style={{ fontWeight:600, color:'#00204E' }}>{p.name}</td>
                      <td style={{ textAlign:'center' }}>{p.sold}</td>
                      <td style={{ textAlign:'right', fontWeight:700, color:'#34A129' }}>
                        ₹{p.revenue.toLocaleString()}
                      </td>
                      <td>
                        <div className="rep-perf-wrap">
                          <div className="rep-perf-bar"
                            style={{ width:`${p.performance}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default Reports