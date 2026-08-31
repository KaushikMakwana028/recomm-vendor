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
} from "react-icons/fa";
import { fetchOrders, updateOrderStatus } from "../redux/orderSlice";
import { useLanguage } from "../contexts/LanguageContext";
import Layout from "../components/Layout";
import OrderDetail from "./OrderDetail";

const statusConfig = {
  new: { color: "#00204E", bg: "#f0f9ff" },
  accepted: { color: "#34A129", bg: "#dcfce7" },
  packed: { color: "#189031", bg: "#bbf7d0" },
  out_for_delivery: { color: "#00204E", bg: "#f0f9ff" },
  delivered: { color: "#34A129", bg: "#dcfce7" },
  cancelled: { color: "#ef4444", bg: "#fef2f2" },
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelected] = useState(null);

  const { orders, loading } = useSelector((s) => s.order);
  const { t } = useLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOrders())
      .unwrap()
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, [dispatch]);

  const tabs = [
    { key: "new", label: t("orders.newOrders") || "New" },
    { key: "accepted", label: t("orders.accepted") || "Accepted" },
    { key: "packed", label: t("orders.packed") || "Packed" },
    {
      key: "out_for_delivery",
      label: t("orders.outForDelivery") || "Out for Delivery",
    },
    { key: "delivered", label: t("orders.delivered") || "Delivered" },
    { key: "cancelled", label: t("orders.cancelled") || "Cancelled" },
  ];

  const filtered = orders.filter((o) => o.status === activeTab);

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
            const count = orders.filter((o) => o.status === tab.key).length;
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
              const sc = statusConfig[order.status] || statusConfig.new;
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
                                {order.status.replace(/_/g, " ")}
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

                            {order.status === "new" && (
                              <>
                                <button
                                  className="ord__btn ord__btn-accept"
                                  onClick={() =>
                                    dispatch(
                                      updateOrderStatus({
                                        id: order.id,
                                        status: "accepted",
                                      }),
                                    )
                                  }
                                >
                                  <FaCheck size={13} /> Accept Order
                                </button>
                                <button
                                  className="ord__btn ord__btn-reject"
                                  onClick={() =>
                                    dispatch(
                                      updateOrderStatus({
                                        id: order.id,
                                        status: "cancelled",
                                      }),
                                    )
                                  }
                                >
                                  <FaTimes size={13} /> Reject Order
                                </button>
                              </>
                            )}

                            {order.status === "accepted" && (
                              <button
                                className="ord__btn ord__btn-packed"
                                onClick={() =>
                                  dispatch(
                                    updateOrderStatus({
                                      id: order.id,
                                      status: "packed",
                                    }),
                                  )
                                }
                              >
                                <FaBox size={13} /> Mark as Packed
                              </button>
                            )}

                            {order.status === "packed" && (
                              <button
                                className="ord__btn ord__btn-deliver"
                                onClick={() =>
                                  dispatch(
                                    updateOrderStatus({
                                      id: order.id,
                                      status: "out_for_delivery",
                                    }),
                                  )
                                }
                              >
                                <FaTruck size={13} /> Out for Delivery
                              </button>
                            )}

                            {order.status === "out_for_delivery" && (
                              <button
                                className="ord__btn ord__btn-done"
                                onClick={() =>
                                  dispatch(
                                    updateOrderStatus({
                                      id: order.id,
                                      status: "delivered",
                                    }),
                                  )
                                }
                              >
                                <FaCheckCircle size={13} /> Mark as Delivered
                              </button>
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
          <OrderDetail order={selectedOrder} />
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Orders;
