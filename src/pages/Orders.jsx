import { useState, useEffect } from "react";
import { Row, Col, Card, Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaCheckCircle,
  FaPrint,
  FaDownload,
} from "react-icons/fa";
import { fetchOrders, updateOrderStatus } from "../redux/orderSlice";
import { fetchProfile } from "../redux/storeSlice";
import { useLanguage } from "../contexts/LanguageContext";
import Layout from "../components/Layout";
import OrderDetail from "./OrderDetail";
import {
  showOrderSuccessAlert,
  showOrderErrorAlert,
  confirmRejectOrder,
} from "../utils/orderAlert";
import {
  printOrderInvoice,
  downloadOrderInvoice,
} from "../utils/invoiceGenerator";

const statusConfig = {
  pending: { color: "#00204E", bg: "#f0f9ff", label: "New" },
  confirmed: { color: "#34A129", bg: "#dcfce7", label: "Accepted" },
  packed: { color: "#189031", bg: "#bbf7d0", label: "Packed" },
  out_for_delivery: { color: "#00204E", bg: "#f0f9ff", label: "Out for Delivery" },
  delivered: { color: "#34A129", bg: "#dcfce7", label: "Delivered" },
  cancelled: { color: "#ef4444", bg: "#fef2f2", label: "Cancelled" },
  new: { color: "#00204E", bg: "#f0f9ff", label: "New" },
  accepted: { color: "#34A129", bg: "#dcfce7", label: "Accepted" },
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelected] = useState(null);

  const { orders, loading } = useSelector((s) => s.order);
  const { profile } = useSelector((s) => s.store);
  const { user } = useSelector((s) => s.auth);
  const { t } = useLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOrders())
      .unwrap()
      .catch((err) => console.error("Failed to fetch orders:", err));
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const handleStatusUpdate = async (order, targetStatus, extraPayload = {}) => {
    if (!order) return;

    if (targetStatus === "cancelled") {
      const confirmed = await confirmRejectOrder(order.orderNumber);
      if (!confirmed) return;
    }

    try {
      await dispatch(
        updateOrderStatus({
          id: order.id,
          status: targetStatus,
          ...extraPayload,
        }),
      ).unwrap();

      // Close detail modal if open
      setShowDetail(false);
      setSelected(null);

      // Automatically switch to that section/tab
      setActiveTab(targetStatus);

      // Step-tailored alerts
      const stepMessages = {
        confirmed: {
          title: "Order Accepted! 🎉",
          html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> has been accepted.</p><span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:600; color:#34A129; background:#dcfce7; padding:4px 12px; border-radius:12px;">Moved to Accepted section</span>`,
        },
        accepted: {
          title: "Order Accepted! 🎉",
          html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> has been accepted.</p><span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:600; color:#34A129; background:#dcfce7; padding:4px 12px; border-radius:12px;">Moved to Accepted section</span>`,
        },
        packed: {
          title: "Order Packed! 📦",
          html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> is packed and ready for delivery.</p><span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:600; color:#189031; background:#bbf7d0; padding:4px 12px; border-radius:12px;">Moved to Packed section</span>`,
        },
        out_for_delivery: {
          title: "Out for Delivery! 🚚",
          html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> is on the way. Bill generated automatically 🧾</p><span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:600; color:#00204E; background:#f0f9ff; padding:4px 12px; border-radius:12px;">Moved to Out for Delivery section</span>`,
        },
        delivered: {
          title: "Order Delivered! ✅",
          html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> has been delivered successfully.</p><span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:600; color:#34A129; background:#dcfce7; padding:4px 12px; border-radius:12px;">Moved to Delivered section</span>`,
        },
        cancelled: {
          title: "Order Rejected",
          html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> has been rejected.</p><span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:600; color:#ef4444; background:#fef2f2; padding:4px 12px; border-radius:12px;">Moved to Cancelled section</span>`,
        },
      };

      const info = stepMessages[targetStatus] || {
        title: "Status Updated!",
        html: `<p style="margin: 0; color: #4b5563;">Order <b>#${order.orderNumber}</b> status updated.</p>`,
      };

      showOrderSuccessAlert({
        title: info.title,
        html: info.html,
        timer: 1900,
      });
    } catch (err) {
      console.error("Order status update failed:", err);
      showOrderErrorAlert({
        title: "Update Failed",
        text: typeof err === "string" ? err : (err?.message || "Failed to update order status."),
      });
    }
  };

  const tabs = [
    { key: "pending", label: t("orders.newOrders") || "New" },
    { key: "confirmed", label: t("orders.accepted") || "Accepted" },
    { key: "packed", label: t("orders.packed") || "Packed" },
    {
      key: "out_for_delivery",
      label: t("orders.outForDelivery") || "Out for Delivery",
    },
    { key: "delivered", label: t("orders.delivered") || "Delivered" },
    { key: "cancelled", label: t("orders.cancelled") || "Cancelled" },
  ];

  const filtered = orders.filter((o) => {
    if (activeTab === "pending") return o.status === "pending" || o.status === "new";
    if (activeTab === "confirmed") return o.status === "confirmed" || o.status === "accepted";
    return o.status === activeTab;
  });

  return (
    <Layout>
      <style>{`
        /* ════════════════════════════════
           All classes prefixed ord__
           to avoid sidebar icon conflicts
        ════════════════════════════════ */

        @keyframes ord__shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        .ord__sk {
          background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size:200% 100%;
          animation:ord__shimmer 1.5s infinite; border-radius:8px;
        }

        /* ── Heading ── */
        .ord__title { 
          font-size:1.5rem; font-weight:700; 
          color:#00204E; margin:0 0 4px; 
        }
        .ord__sub   { font-size:.875rem; color:#6b7280; margin:0; }

        /* ── Tabs ── */
        .ord__tabs-wrap {
          border:none !important; border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.07) !important;
          margin-bottom:1.5rem; overflow:hidden; background:#fff;
        }
        .ord__tabs-scroll {
          display:flex; gap:4px; padding:0.625rem 0.875rem;
          overflow-x:auto; border-bottom:1px solid #f3f4f6;
          scrollbar-width:none;
        }
        .ord__tabs-scroll::-webkit-scrollbar { display:none; }

        .ord__tab {
          display:inline-flex; align-items:center; gap:6px;
          padding:0.5rem 1rem; border-radius:10px;
          border:none; background:transparent;
          color:#6b7280; font-size:0.8125rem; font-weight:500;
          font-family:'Poppins',sans-serif;
          cursor:pointer; transition:all .18s; white-space:nowrap; flex-shrink:0;
          min-height:38px;
        }
        .ord__tab:hover:not(.ord__tab-active) { background:#f3f4f6; color:#374151; }
        .ord__tab-active {
          background:linear-gradient(135deg,rgba(0,32,78,0.1),rgba(52,161,41,0.1));
          color:#00204E; font-weight:600;
        }
        .ord__tab-count {
          min-width:20px; height:20px; padding:0 5px;
          background:#e5e7eb; border-radius:10px;
          font-size:0.675rem; font-weight:700;
          display:inline-flex; align-items:center; justify-content:center;
          color:#374151;
        }
        .ord__tab-active .ord__tab-count {
          background:rgba(0,32,78,0.15); color:#00204E;
        }

        /* ── Order card ── */
        .ord__card {
          border:1.5px solid #e5e7eb !important;
          border-radius:16px !important;
          background:#fff;
          margin-bottom:1rem;
          overflow:hidden;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .ord__card:hover {
          border-color:#34A129 !important;
          box-shadow:0 6px 20px rgba(52,161,41,0.1) !important;
        }

        /* ── Card color bar (top accent) ── */
        .ord__accent-bar {
          height: 4px;
          width: 100%;
        }

        /* ── Card body ── */
        .ord__card-body { padding:1.25rem 1.375rem; }

        /* ── Order number row ── */
        .ord__num-row {
          display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:8px;
          margin-bottom:0.875rem;
        }
        .ord__num {
          font-size:1.0625rem; font-weight:800; color:#00204E; margin:0;
        }
        .ord__amount {
          font-size:1.375rem; font-weight:800; 
          color:#00204E; margin:0; line-height:1;
        }

        /* ── Status chip ── */
        .ord__status-chip {
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 12px; border-radius:20px;
          font-size:0.7rem; font-weight:700;
          text-transform:uppercase; letter-spacing:0.4px;
        }

        /* ── Info rows ── */
        .ord__info-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:6px 16px; margin-bottom:0.875rem;
        }
        @media (max-width:480px) { .ord__info-grid { grid-template-columns:1fr; } }
        .ord__info-item { font-size:0.8125rem; color:#6b7280; }
        .ord__info-item strong { color:#374151; }

        /* ── Items preview ── */
        .ord__items-wrap {
          border-top:1px solid #f3f4f6; padding-top:0.875rem;
          margin-top:0.625rem; margin-bottom:0.875rem;
        }
        .ord__items-label {
          font-size:0.75rem; font-weight:700; color:#9ca3af;
          text-transform:uppercase; letter-spacing:0.4px; margin-bottom:6px;
        }
        .ord__item-tag {
          display:inline-block; padding:3px 10px; border-radius:6px;
          background:#f3f4f6; color:#374151;
          font-size:0.775rem; font-weight:500; margin:0 4px 4px 0;
        }

        /* ── Action buttons — LARGE ── */
        .ord__actions { display:flex; flex-direction:column; gap:8px; }
        .ord__btn {
          display:flex; align-items:center; justify-content:center;
          gap:8px; padding:0.75rem 1.25rem;
          border-radius:12px; font-size:0.875rem; font-weight:600;
          font-family:'Poppins',sans-serif;
          cursor:pointer; min-height:44px; border:none;
          transition:all 0.2s ease; width:100%;
        }
        .ord__btn svg { display:block !important; overflow:visible !important; flex-shrink:0; }
        .ord__btn:hover { transform:translateY(-2px); }

        .ord__btn-view    { background:#f3f4f6; color:#374151; }
        .ord__btn-view:hover { background:#e5e7eb; }
        .ord__btn-accept  { 
          background:linear-gradient(135deg,#34A129,#189031); 
          color:#fff; box-shadow:0 3px 10px rgba(52,161,41,0.25); 
        }
        .ord__btn-accept:hover { 
          box-shadow:0 6px 18px rgba(52,161,41,0.35); 
        }
        .ord__btn-reject  { 
          background:linear-gradient(135deg,#ef4444,#dc2626); 
          color:#fff; box-shadow:0 3px 10px rgba(239,68,68,0.25); 
        }
        .ord__btn-reject:hover { 
          box-shadow:0 6px 18px rgba(239,68,68,0.35); 
        }
        .ord__btn-packed  { 
          background:linear-gradient(135deg,#00204E,#1e40af); 
          color:#fff; box-shadow:0 3px 10px rgba(0,32,78,0.25); 
        }
        .ord__btn-packed:hover { 
          box-shadow:0 6px 18px rgba(0,32,78,0.35); 
        }
        .ord__btn-deliver { 
          background:linear-gradient(135deg,#189031,#00204E); 
          color:#fff; box-shadow:0 3px 10px rgba(24,144,49,0.25); 
        }
        .ord__btn-deliver:hover { 
          box-shadow:0 6px 18px rgba(24,144,49,0.35); 
        }
        .ord__btn-done    { 
          background:linear-gradient(135deg,#34A129,#189031); 
          color:#fff; box-shadow:0 3px 10px rgba(52,161,41,0.25); 
        }
        .ord__btn-done:hover { 
          box-shadow:0 6px 18px rgba(52,161,41,0.35); 
        }
        .ord__btn-print   { 
          background:#f8fafc; color:#00204E; 
          border:1.5px solid #cbd5e1 !important; 
        }
        .ord__btn-print:hover { 
          background:#e2e8f0; color:#001635; 
        }
        .ord__btn-download { 
          background:#f0fdf4; color:#166534; 
          border:1.5px solid #bbf7d0 !important; 
        }
        .ord__btn-download:hover { 
          background:#dcfce7; color:#14532d; 
        }

        /* ── Empty state ── */
        .ord__empty {
          border:none !important; border-radius:16px !important;
          box-shadow:0 2px 10px rgba(0,32,78,0.07) !important;
          background:#fff; text-align:center; padding:4rem 2rem;
        }
        .ord__empty svg { display:block !important; overflow:visible !important; }

        @media (max-width:576px) {
          .ord__title   { font-size:1.25rem; }
          .ord__card-body { padding:1rem; }
          .ord__amount  { font-size:1.125rem; }
        }
      `}</style>

      {/* ── Heading ── */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="ord__title">{t("orders.title") || "Orders"}</h2>
        <p className="ord__sub">Manage and track your orders</p>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="ord__tabs-wrap">
        <div className="ord__tabs-scroll">
          {tabs.map((tab) => {
            const count = orders.filter((o) => {
              if (tab.key === "pending") return o.status === "pending" || o.status === "new";
              if (tab.key === "confirmed") return o.status === "confirmed" || o.status === "accepted";
              return o.status === tab.key;
            }).length;
            return (
              <button
                key={tab.key}
                className={`ord__tab ${activeTab === tab.key ? "ord__tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className="ord__tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Order cards ── */}
      <Row>
        <Col>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="ord__card" style={{ padding: "1.25rem" }}>
                <div
                  className="ord__sk mb-3"
                  style={{ height: 22, width: "40%" }}
                />
                <div
                  className="ord__sk mb-2"
                  style={{ height: 15, width: "65%" }}
                />
                <div className="ord__sk" style={{ height: 15, width: "50%" }} />
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((order, idx) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.05 }}
                >
                  <div className="ord__card">
                    {/* Accent bar */}
                    <div
                      className="ord__accent-bar"
                      style={{
                        background: `linear-gradient(90deg,${sc.color},${sc.color}88)`,
                      }}
                    />

                    <div className="ord__card-body">
                      <Row className="align-items-start g-3">
                        {/* ── Left: order info ── */}
                        <Col xs={12} lg={8}>
                          {/* Number + amount */}
                          <div className="ord__num-row">
                            <div>
                              <h5 className="ord__num">{order.orderNumber}</h5>
                              <span
                                className="ord__status-chip"
                                style={{ background: sc.bg, color: sc.color }}
                              >
                                {sc.label || order.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <p className="ord__amount">₹{order.totalAmount}</p>
                          </div>

                          {/* Info grid */}
                          <div className="ord__info-grid">
                            <p className="ord__info-item">
                              <strong>Customer:</strong> {order.customerName}
                            </p>
                            <p className="ord__info-item">
                              <strong>Mobile:</strong> {order.mobile}
                            </p>
                            <p className="ord__info-item">
                              <strong>Payment:</strong> {order.paymentMethod}
                            </p>
                            <p className="ord__info-item" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <strong>Delivery Type:</strong>
                              <span style={{
                                background: order.deliveryType === "urgent" ? "#dc2626" : "#f3f4f6",
                                color: order.deliveryType === "urgent" ? "#ffffff" : "#374151",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {order.deliveryType === "urgent" ? "Urgent Delivery" : "Normal Delivery"}
                              </span>
                            </p>
                            {order.deliveryOption && (
                              <p className="ord__info-item" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                <strong>Delivery Mode:</strong>
                                <span style={{
                                  background: order.deliveryOption === "self" ? "#e0f2fe" : "#f3e8ff",
                                  color: order.deliveryOption === "self" ? "#0369a1" : "#6b21a8",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.72rem",
                                  fontWeight: 700
                                }}>
                                  {order.deliveryOption === "self" ? "By Self" : "Delivery Partner"}
                                </span>
                                <span style={{ color: '#4b5563', fontWeight: 600 }}>
                                  ({order.distance} KM)
                                </span>
                              </p>
                            )}
                            {/* Prominent Delivery Time Slot badge alongside delivery responsibility */}
                            <p className="ord__info-item" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <strong>Time Slot:</strong>
                              <span style={{
                                background: order.chosenTimeOption === "immediately" ? "#fee2e2" : order.chosenTimeOption === "lunch" ? "#fef3c7" : order.chosenTimeOption === "dinner" ? "#ede9fe" : "#e0f2fe",
                                color: order.chosenTimeOption === "immediately" ? "#991b1b" : order.chosenTimeOption === "lunch" ? "#92400e" : order.chosenTimeOption === "dinner" ? "#5b21b6" : "#075985",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                ⏱️ {order.chosenTimeOption ? order.chosenTimeOption.toUpperCase() : "IMMEDIATELY"}
                              </span>
                              {order.estimatedWindowFormatted && (
                                <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.78rem' }}>
                                  ({order.estimatedWindowFormatted})
                                </span>
                              )}
                            </p>
                            <p className="ord__info-item">
                              <strong>Time:</strong>{" "}
                              {new Date(order.orderDate).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>

                          <p
                            className="ord__info-item"
                            style={{ marginBottom: "0.875rem" }}
                          >
                            <strong>Address:</strong> {order.address}
                          </p>

                          {/* Items preview */}
                          <div className="ord__items-wrap">
                            <p className="ord__items-label">Items</p>
                            <div>
                              {order.items.map((item, i) => (
                                <span key={i} className="ord__item-tag">
                                  {item.name} × {item.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Col>

                        {/* ── Right: action buttons ── */}
                        <Col xs={12} lg={4}>
                          <div className="ord__actions">
                            <button
                              className="ord__btn ord__btn-view"
                              onClick={() => {
                                setSelected(order);
                                setShowDetail(true);
                              }}
                            >
                              <FaEye size={14} /> View Details
                            </button>

                            {(order.status === "pending" || order.status === "new") && (
                              <>
                                <button
                                  className="ord__btn ord__btn-accept"
                                  onClick={() => handleStatusUpdate(order, "confirmed")}
                                >
                                  <FaCheck size={13} /> Accept Order
                                </button>
                                <button
                                  className="ord__btn ord__btn-reject"
                                  onClick={() => handleStatusUpdate(order, "cancelled")}
                                >
                                  <FaTimes size={13} /> Reject Order
                                </button>
                              </>
                            )}

                            {(order.status === "confirmed" || order.status === "accepted") && (
                              <button
                                className="ord__btn ord__btn-packed"
                                onClick={() => handleStatusUpdate(order, "packed")}
                              >
                                <FaBox size={13} /> Mark as Packed
                              </button>
                            )}

                             {order.status === "packed" && (
                               <button
                                 className="ord__btn ord__btn-deliver"
                                 onClick={() => {
                                   setSelected(order);
                                   setShowDetail(true);
                                 }}
                               >
                                 <FaTruck size={13} /> Set Delivery & Ship
                               </button>
                             )}

                            {order.status === "out_for_delivery" && (
                              <>
                                <button
                                  className="ord__btn ord__btn-done"
                                  onClick={() => handleStatusUpdate(order, "delivered")}
                                >
                                  <FaCheckCircle size={13} /> Mark as Delivered
                                </button>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                                  <button
                                    className="ord__btn ord__btn-print"
                                    onClick={() => printOrderInvoice(order, profile || user)}
                                    title="Print Bill"
                                  >
                                    <FaPrint size={12} /> Print Bill
                                  </button>
                                  <button
                                    className="ord__btn ord__btn-download"
                                    onClick={() => downloadOrderInvoice(order, profile || user)}
                                    title="Download Bill"
                                  >
                                    <FaDownload size={12} /> Download
                                  </button>
                                </div>
                              </>
                            )}

                            {order.status === "delivered" && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                                <button
                                  className="ord__btn ord__btn-print"
                                  onClick={() => printOrderInvoice(order, profile || user)}
                                  title="Print Bill"
                                >
                                  <FaPrint size={12} /> Print Bill
                                </button>
                                <button
                                  className="ord__btn ord__btn-download"
                                  onClick={() => downloadOrderInvoice(order, profile || user)}
                                  title="Download Bill"
                                >
                                  <FaDownload size={12} /> Download
                                </button>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="ord__empty">
              <FaShoppingCart
                size={52}
                color="#e5e7eb"
                style={{ margin: "0 auto 1rem" }}
              />
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.9375rem" }}>
                No orders in this category
              </p>
            </div>
          )}
        </Col>
      </Row>

      {/* ── Detail Modal ── */}
      <Modal
        show={showDetail}
        onHide={() => {
          setShowDetail(false);
          setSelected(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #f3f4f6" }}>
          <Modal.Title
            style={{
              fontFamily: "Poppins,sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#00204E",
            }}
          >
            {t("orders.orderDetails") || "Order Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.375rem" }}>
          <OrderDetail
            order={selectedOrder}
            storeProfile={profile || user}
            onStatusUpdate={handleStatusUpdate}
            onClose={() => {
              setShowDetail(false);
              setSelected(null);
            }}
          />
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Orders;
