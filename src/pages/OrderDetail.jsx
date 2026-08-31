import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaTruck,
  FaShoppingBag,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaClock,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { updateOrderStatus } from "../redux/orderSlice";

const statusConfig = {
  new: { color: "#f59e0b", bg: "#fffbeb", label: "New", icon: FaShoppingBag },
  accepted: {
    color: "#34A129",
    bg: "#dcfce7",
    label: "Accepted",
    icon: FaCheckCircle,
  },
  packed: { color: "#189031", bg: "#bbf7d0", label: "Packed", icon: FaBox },
  out_for_delivery: {
    color: "#00204E",
    bg: "#f0f9ff",
    label: "Out for Delivery",
    icon: FaTruck,
  },
  delivered: {
    color: "#34A129",
    bg: "#dcfce7",
    label: "Delivered",
    icon: FaCheckCircle,
  },
  cancelled: {
    color: "#ef4444",
    bg: "#fef2f2",
    label: "Cancelled",
    icon: FaTimesCircle,
  },
};

const steps = ["new", "accepted", "packed", "out_for_delivery", "delivered"];

const OrderDetail = ({ order }) => {
  const dispatch = useDispatch();
  if (!order) return null;

  const sc = statusConfig[order.status] || statusConfig.new;
  const StatusIcon = sc.icon;
  const stepIdx = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const items = order.items || [];

  return (
    <>
      <style>{`
        /* ════════ ORDER DETAIL MODAL ════════ */
        .od-wrap { font-family:'Poppins',sans-serif; }

        /* ── Hero banner ── */
        .od-hero {
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .od-hero-left { display:flex; align-items:center; gap:14px; }
        .od-hero-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.375rem; flex-shrink: 0;
        }
        .od-hero-icon svg { display:block !important; overflow:visible !important; }
        .od-order-num {
          font-size: 1.1875rem; font-weight: 800;
          color: #00204E; margin: 0 0 5px;
        }
        .od-status-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 0.75rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .od-amount {
          font-size: 1.875rem; font-weight: 800;
          line-height: 1; margin: 0;
        }
        .od-amount-label {
          font-size: 0.75rem; font-weight: 500;
          color: #9ca3af; margin: 0 0 4px; text-align:right;
        }

        /* ── Progress tracker ── */
        .od-tracker {
          background: #fff; border: 1px solid #f3f4f6;
          border-radius: 14px; padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        .od-tracker-title {
          font-size: 0.8125rem; font-weight: 600;
          color: #9ca3af; text-transform: uppercase;
          letter-spacing: 0.5px; margin: 0 0 1.125rem;
        }
        .od-steps {
          display: flex; align-items: center; position: relative;
        }
        .od-step {
          display: flex; flex-direction: column;
          align-items: center; flex: 1; position: relative;
        }
        .od-step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700;
          position: relative; z-index: 1;
          transition: all 0.3s;
        }
        .od-step-dot svg { display:block !important; overflow:visible !important; }
        .od-step-dot.done {
          background: linear-gradient(135deg,#34A129,#189031);
          color: #fff; box-shadow: 0 3px 10px rgba(52,161,41,0.3);
        }
        .od-step-dot.current {
          background: linear-gradient(135deg,#00204E,#34A129);
          color: #fff; box-shadow: 0 3px 12px rgba(0,32,78,0.4);
        }
        .od-step-dot.pending {
          background: #f3f4f6; color: #9ca3af;
        }
        .od-step-label {
          font-size: 0.675rem; font-weight: 600;
          color: #9ca3af; margin-top: 6px;
          text-align: center; text-transform: uppercase;
          letter-spacing: 0.3px; white-space: nowrap;
        }
        .od-step-label.done    { color: #34A129; }
        .od-step-label.current { color: #00204E; }
        .od-step-line {
          flex: 1; height: 3px; border-radius: 2px;
          margin: 0 -2px; margin-bottom: 20px;
          position: relative; z-index: 0;
        }
        .od-step-line.done    { background: linear-gradient(90deg,#34A129,#189031); }
        .od-step-line.pending { background: #f3f4f6; }

        .od-cancelled-banner {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 1rem 1.25rem;
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem; font-weight: 500; color: #dc2626;
        }
        .od-cancelled-banner svg {
          display:block !important; overflow:visible !important; flex-shrink:0;
        }

        /* ── Info sections ── */
        .od-section {
          background: #fff; border: 1px solid #f3f4f6;
          border-radius: 14px; padding: 1.25rem 1.375rem;
          margin-bottom: 1.25rem;
        }
        .od-section:last-child { margin-bottom: 0; }
        .od-section-title {
          font-size: 0.8rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: #9ca3af; margin: 0 0 1rem;
          display: flex; align-items: center; gap: 7px;
        }
        .od-section-title svg {
          display:block !important; overflow:visible !important; flex-shrink:0;
        }

        /* ── Info rows ── */
        .od-info-row {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          gap: 12px; padding: 0.5rem 0;
          border-bottom: 1px solid #f9fafb;
          font-size: 0.8375rem;
        }
        .od-info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .od-info-key { color: #6b7280; font-weight: 500; flex-shrink: 0; }
        .od-info-val { color: #00204E; font-weight: 600; text-align: right; }

        /* ── Items list ── */
        .od-item-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          padding: 0.75rem 0; border-bottom: 1px solid #f9fafb;
        }
        .od-item-row:last-child { border-bottom: none; }
        .od-item-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg,#00204E,#34A129);
          flex-shrink: 0;
        }
        .od-item-name { font-size:0.875rem; font-weight:600; color:#00204E; }
        .od-item-qty  { font-size:0.775rem; color:#9ca3af; margin-top:2px; }
        .od-item-price {
          font-size: 0.9375rem; font-weight: 700; color: #34A129;
          white-space: nowrap;
        }

        /* ── Total row ── */
        .od-total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.875rem 1rem; margin-top: 0.75rem;
          background: linear-gradient(135deg,rgba(0,32,78,0.06),rgba(52,161,41,0.06));
          border-radius: 10px;
        }
        .od-total-label { font-size:0.9rem; font-weight:700; color:#00204E; }
        .od-total-val   { font-size:1.25rem; font-weight:800; color:#34A129; }

        /* ── Action buttons ── */
        .od-actions { display:flex; flex-direction:column; gap:10px; margin-top:1.5rem; }
        .od-action-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 0.75rem 1.5rem;
          border-radius: 12px; font-size: 0.9375rem;
          font-weight: 600; font-family:'Poppins',sans-serif;
          border: none; cursor: pointer; min-height: 48px;
          transition: all 0.2s ease;
        }
        .od-action-btn svg { display:block !important; overflow:visible !important; flex-shrink:0; }
        .od-action-btn:hover { transform:translateY(-2px); }
        .od-btn-accept  { background:linear-gradient(135deg,#34A129,#189031); color:#fff; box-shadow:0 4px 12px rgba(52,161,41,.3); }
        .od-btn-reject  { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 4px 12px rgba(239,68,68,.3); }
        .od-btn-packed  { background:linear-gradient(135deg,#00204E,#34A129); color:#fff; box-shadow:0 4px 12px rgba(0,32,78,.3); }
        .od-btn-deliver { background:linear-gradient(135deg,#189031,#00204E); color:#fff; box-shadow:0 4px 12px rgba(24,144,49,.3); }
        .od-btn-done    { background:linear-gradient(135deg,#34A129,#189031); color:#fff; box-shadow:0 4px 12px rgba(52,161,41,.3); }
        .od-btn-accept:hover  { box-shadow:0 8px 20px rgba(52,161,41,.4); }
        .od-btn-reject:hover  { box-shadow:0 8px 20px rgba(239,68,68,.4); }
        .od-btn-packed:hover  { box-shadow:0 8px 20px rgba(0,32,78,.4); }
        .od-btn-deliver:hover { box-shadow:0 8px 20px rgba(24,144,49,.4); }
        .od-btn-done:hover    { box-shadow:0 8px 20px rgba(52,161,41,.4); }
      `}</style>

      <div className="od-wrap">
        {/* ── Hero ── */}
        <motion.div
          className="od-hero"
          style={{ background: sc.bg }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="od-hero-left">
            <div
              className="od-hero-icon"
              style={{ background: `${sc.color}20` }}
            >
              <StatusIcon style={{ color: sc.color }} />
            </div>
            <div>
              <h5 className="od-order-num">{order.orderNumber}</h5>
              <span
                className="od-status-chip"
                style={{ background: `${sc.color}18`, color: sc.color }}
              >
                {sc.label}
              </span>
            </div>
          </div>
          <div className="text-end">
            <p className="od-amount-label">Total Amount</p>
            <p className="od-amount" style={{ color: sc.color }}>
              ₹{order.totalAmount}
            </p>
          </div>
        </motion.div>

        {/* ── Progress tracker / cancelled banner ── */}
        {isCancelled ? (
          <div className="od-cancelled-banner">
            <FaTimesCircle size={18} />
            This order was cancelled.
          </div>
        ) : (
          <div className="od-tracker">
            <p className="od-tracker-title">Order Progress</p>
            <div className="od-steps">
              {steps.map((step, i) => {
                const state =
                  i < stepIdx ? "done" : i === stepIdx ? "current" : "pending";
                const labels = [
                  "New",
                  "Accepted",
                  "Packed",
                  "Delivery",
                  "Delivered",
                ];
                return (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: i < steps.length - 1 ? 1 : "none",
                    }}
                  >
                    <div className="od-step">
                      <div className={`od-step-dot ${state}`}>
                        {state === "done" ? <FaCheck size={11} /> : i + 1}
                      </div>
                      <span className={`od-step-label ${state}`}>
                        {labels[i]}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`od-step-line ${i < stepIdx ? "done" : "pending"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Customer info ── */}
        <div className="od-section">
          <p className="od-section-title">
            <FaUser size={12} /> Customer Info
          </p>
          {[
            { key: "Name", val: order.customerName },
            { key: "Mobile", val: order.mobile },
            { key: "Address", val: order.address },
          ].map(({ key, val }) => (
            <div key={key} className="od-info-row">
              <span className="od-info-key">{key}</span>
              <span className="od-info-val">{val}</span>
            </div>
          ))}
        </div>

        {/* ── Order info ── */}
        <div className="od-section">
          <p className="od-section-title">
            <FaClock size={12} /> Order Info
          </p>
          {[
            {
              key: "Date & Time",
              val: new Date(order.orderDate).toLocaleString("en-IN"),
            },
            { key: "Payment", val: order.paymentMethod },
          ].map(({ key, val }) => (
            <div key={key} className="od-info-row">
              <span className="od-info-key">{key}</span>
              <span className="od-info-val">{val}</span>
            </div>
          ))}
        </div>

        {/* ── Items ── */}
        <div className="od-section">
          <p className="od-section-title">
            <FaBox size={12} /> Order Items
          </p>
          {items.map((item, i) => (
            <div key={i} className="od-item-row">
              <div className="d-flex align-items-center gap-3">
                <div className="od-item-dot" />
                <div>
                  <p className="od-item-name">{item.name}</p>
                  <p className="od-item-qty">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
              </div>
              <p className="od-item-price">₹{item.price * item.quantity}</p>
            </div>
          ))}
          <div className="od-total-row">
            <span className="od-total-label">Total</span>
            <span className="od-total-val">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="od-actions">
          {order.status === "new" && (
            <>
              <button
                className="od-action-btn od-btn-accept"
                onClick={() =>
                  dispatch(
                    updateOrderStatus({ id: order.id, status: "accepted" }),
                  )
                }
              >
                <FaCheck size={14} /> Accept Order
              </button>
              <button
                className="od-action-btn od-btn-reject"
                onClick={() =>
                  dispatch(
                    updateOrderStatus({ id: order.id, status: "cancelled" }),
                  )
                }
              >
                <FaTimes size={14} /> Reject Order
              </button>
            </>
          )}
          {order.status === "accepted" && (
            <button
              className="od-action-btn od-btn-packed"
              onClick={() =>
                dispatch(updateOrderStatus({ id: order.id, status: "packed" }))
              }
            >
              <FaBox size={14} /> Mark as Packed
            </button>
          )}
          {order.status === "packed" && (
            <button
              className="od-action-btn od-btn-deliver"
              onClick={() =>
                dispatch(
                  updateOrderStatus({
                    id: order.id,
                    status: "out_for_delivery",
                  }),
                )
              }
            >
              <FaTruck size={14} /> Out for Delivery
            </button>
          )}
          {order.status === "out_for_delivery" && (
            <button
              className="od-action-btn od-btn-done"
              onClick={() =>
                dispatch(
                  updateOrderStatus({ id: order.id, status: "delivered" }),
                )
              }
            >
              <FaCheckCircle size={14} /> Mark as Delivered
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
