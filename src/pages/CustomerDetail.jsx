import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import {
  FaPhone, FaEnvelope, FaStar, FaShoppingBag,
  FaRupeeSign, FaClock, FaBoxOpen, FaCheckCircle,
} from 'react-icons/fa'

const statusConfig = {
  pending:          { color: '#f59e0b', bg: '#fffbeb', label: 'New'              },
  confirmed:        { color: '#34A129', bg: '#dcfce7', label: 'Accepted'         },
  new:              { color: '#f59e0b', bg: '#fffbeb', label: 'New'              },
  accepted:         { color: '#34A129', bg: '#dcfce7', label: 'Accepted'         },
  packed:           { color: '#189031', bg: '#bbf7d0', label: 'Packed'           },
  out_for_delivery: { color: '#00204E', bg: '#f0f9ff', label: 'Out for Delivery' },
  delivered:        { color: '#34A129', bg: '#dcfce7', label: 'Delivered'        },
  cancelled:        { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled'        },
}

const CustomerDetail = ({ customer }) => {
  const { orders } = useSelector((state) => state.order)
  if (!customer) return null

  const customerOrders = orders.filter((o) => o.customerName === customer.name)
  const delivered      = customerOrders.filter((o) => o.status === 'delivered').length
  const avgOrder       = customerOrders.length
    ? Math.round(customer.totalSpent / customerOrders.length)
    : 0

  return (
    <>
      <style>{`
        /* ════════ CUSTOMER DETAIL MODAL ════════ */
        .cd-wrap { font-family:'Poppins',sans-serif; }

        /* ── Hero ── */
        .cd-hero {
          background: linear-gradient(135deg,rgba(0,32,78,0.07),rgba(52,161,41,0.07));
          border: 1px solid rgba(0,32,78,0.12);
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 1.375rem;
          display: flex;
          align-items: center;
          gap: 1.125rem;
          flex-wrap: wrap;
        }
        .cd-avatar {
          width: 70px; height: 70px; border-radius: 50%;
          background: linear-gradient(135deg,#00204E,#34A129);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.75rem; font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(0,32,78,0.3);
        }
        .cd-name {
          font-size: 1.1875rem; font-weight: 800;
          color: #00204E; margin: 0 0 6px;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .cd-repeat-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          background: linear-gradient(135deg,#34A129,#189031);
          color: #fff; font-size: 0.7rem; font-weight: 700;
        }
        .cd-repeat-badge svg { display:block !important; overflow:visible !important; }
        .cd-contact-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.8125rem; color: #6b7280;
          margin-bottom: 3px; font-weight: 500;
        }
        .cd-contact-row:last-child { margin-bottom: 0; }
        .cd-contact-row svg { display:block !important; overflow:visible !important; flex-shrink:0; }

        /* ── Stat cards ── */
        .cd-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 1.375rem;
        }
        @media (max-width:576px) { .cd-stats { grid-template-columns: repeat(2,1fr); } }
        .cd-stat-card {
          background: #fff; border: 1px solid #f3f4f6;
          border-radius: 14px; padding: 1rem 0.875rem;
          text-align: center;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .cd-stat-card:hover {
          box-shadow: 0 4px 14px rgba(0,32,78,0.08);
          transform: translateY(-2px);
        }
        .cd-stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 8px; font-size: 0.9rem;
        }
        .cd-stat-icon svg { display:block !important; overflow:visible !important; }
        .cd-stat-val {
          font-size: 1.1875rem; font-weight: 800;
          color: #00204E; margin: 0 0 3px; line-height: 1;
        }
        .cd-stat-lbl {
          font-size: 0.7rem; color: #9ca3af;
          font-weight: 500; margin: 0;
        }

        /* ── Contact buttons ── */
        .cd-contact-btns {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 1.375rem;
        }
        .cd-contact-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 0.75rem 1rem;
          border-radius: 12px; font-size: 0.875rem; font-weight: 600;
          font-family: 'Poppins',sans-serif;
          cursor: pointer; min-height: 46px;
          text-decoration: none; transition: all 0.2s;
          border: none;
        }
        .cd-contact-btn svg { display:block !important; overflow:visible !important; flex-shrink:0; }
        .cd-btn-call {
          background: linear-gradient(135deg,#34A129,#189031);
          color: #fff; box-shadow: 0 4px 12px rgba(52,161,41,0.25);
        }
        .cd-btn-call:hover {
          color: #fff; transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(52,161,41,0.35);
        }
        .cd-btn-email {
          background: linear-gradient(135deg,#00204E,#34A129);
          color: #fff; box-shadow: 0 4px 12px rgba(0,32,78,0.25);
        }
        .cd-btn-email:hover {
          color: #fff; transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,32,78,0.35);
        }

        /* ── Order history section ── */
        .cd-history-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem;
        }
        .cd-history-title {
          font-size: 0.875rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: #00204E; margin: 0;
        }
        .cd-history-count {
          padding: 3px 10px; border-radius: 20px;
          background: #f3f4f6; color: #6b7280;
          font-size: 0.75rem; font-weight: 600;
        }

        /* ── Order history item ── */
        .cd-order-item {
          background: #fff; border: 1px solid #f3f4f6;
          border-radius: 14px; padding: 1rem 1.125rem;
          margin-bottom: 0.75rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .cd-order-item:last-child { margin-bottom: 0; }
        .cd-order-item:hover {
          border-color: #dcfce7;
          box-shadow: 0 3px 12px rgba(52,161,41,0.08);
        }
        .cd-order-num {
          font-size: 0.9rem; font-weight: 700; 
          color: #00204E; margin: 0 0 3px;
        }
        .cd-order-date {
          font-size: 0.75rem; color: #9ca3af; font-weight: 500; margin: 0;
        }
        .cd-order-status {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 0.7rem; font-weight: 700; text-transform: capitalize;
          margin-bottom: 4px;
        }
        .cd-order-amount {
          font-size: 1rem; font-weight: 800; 
          color: #34A129; margin: 0;
        }

        /* ── Empty state ── */
        .cd-empty {
          text-align: center; padding: 2.5rem 1rem;
          background: #fafafa; border-radius: 14px;
          border: 1px dashed #e5e7eb;
        }
        .cd-empty svg { display:block !important; overflow:visible !important; }
        .cd-empty p {
          color: #9ca3af; margin: 0.75rem 0 0;
          font-size: 0.875rem;
        }

        /* Stat icon background colors */
        .stat-bg-1 { background: #f0f9ff; }
        .stat-bg-2 { background: #dcfce7; }
        .stat-bg-3 { background: #dbeafe; }
        .stat-bg-4 { background: #fef9c3; }

        /* Stat icon colors */
        .stat-color-1 { color: #00204E; }
        .stat-color-2 { color: #34A129; }
        .stat-color-3 { color: #189031; }
        .stat-color-4 { color: #ca8a04; }
      `}</style>

      <div className="cd-wrap">

        {/* ── Hero ── */}
        <motion.div
          className="cd-hero"
          initial={{ opacity:0, y:-10 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3 }}
        >
          <div className="cd-avatar">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="cd-name">
              {customer.name}
              {customer.isRepeat && (
                <span className="cd-repeat-badge">
                  <FaStar size={9} /> Repeat
                </span>
              )}
            </h4>
            <div className="cd-contact-row">
              <FaPhone size={11} color="#00204E" />
              {customer.mobile}
            </div>
            <div className="cd-contact-row">
              <FaEnvelope size={11} color="#00204E" />
              {customer.email}
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          className="cd-stats"
          initial={{ opacity:0, y:10 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.08 }}
        >
          {[
            {
              icon: FaShoppingBag, bgClass: 'stat-bg-1', colorClass: 'stat-color-1',
              val: customer.totalOrders, lbl: 'Total Orders',
            },
            {
              icon: FaRupeeSign, bgClass: 'stat-bg-2', colorClass: 'stat-color-2',
              val: `₹${(customer.totalSpent/1000).toFixed(1)}k`, lbl: 'Total Spent',
            },
            {
              icon: FaCheckCircle, bgClass: 'stat-bg-3', colorClass: 'stat-color-3',
              val: delivered, lbl: 'Delivered',
            },
            {
              icon: FaClock, bgClass: 'stat-bg-4', colorClass: 'stat-color-4',
              val: `₹${avgOrder}`, lbl: 'Avg Order',
            },
          ].map(({ icon: Icon, bgClass, colorClass, val, lbl }, i) => (
            <motion.div
              key={i} className="cd-stat-card"
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <div className={`cd-stat-icon ${bgClass}`}>
                <Icon className={colorClass} size={15} />
              </div>
              <p className="cd-stat-val">{val}</p>
              <p className="cd-stat-lbl">{lbl}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Contact buttons ── */}
        <motion.div
          className="cd-contact-btns"
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.18 }}
        >
          <a href={`tel:${customer.mobile}`} className="cd-contact-btn cd-btn-call">
            <FaPhone size={14} /> Call Customer
          </a>
          <a href={`mailto:${customer.email}`} className="cd-contact-btn cd-btn-email">
            <FaEnvelope size={14} /> Send Email
          </a>
        </motion.div>

        {/* ── Order history ── */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.24 }}
        >
          <div className="cd-history-head">
            <p className="cd-history-title">Order History</p>
            <span className="cd-history-count">{customerOrders.length} orders</span>
          </div>

          {customerOrders.length > 0 ? (
            customerOrders.map((order, i) => {
              const sc = statusConfig[order.status] || statusConfig.new
              return (
                <motion.div
                  key={order.id}
                  className="cd-order-item"
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.26 + i * 0.05 }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="cd-order-num">{order.orderNumber}</p>
                      <p className="cd-order-date">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day:'numeric', month:'short', year:'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-end">
                      <span
                        className="cd-order-status"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                      <p className="cd-order-amount">₹{order.totalAmount}</p>
                    </div>
                  </div>
                  {/* Items preview */}
                  {order.items && order.items.length > 0 && (
                    <div style={{
                      marginTop: 8, paddingTop: 8,
                      borderTop: '1px solid #f9fafb',
                      display: 'flex', flexWrap: 'wrap', gap: 6,
                    }}>
                      {order.items.map((item, j) => (
                        <span key={j} style={{
                          background: '#f3f4f6', color: '#374151',
                          padding: '2px 8px', borderRadius: 6,
                          fontSize: '0.72rem', fontWeight: 500,
                        }}>
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })
          ) : (
            <div className="cd-empty">
              <FaBoxOpen size={36} color="#e5e7eb"
                style={{ display:'block', margin:'0 auto' }} />
              <p>No order history available</p>
            </div>
          )}
        </motion.div>

      </div>
    </>
  )
}

export default CustomerDetail