import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
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
import { fetchProfile } from "../redux/storeSlice";

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
  const { profile } = useSelector((state) => state.store);
  const { user } = useSelector((state) => state.auth);
  const [deliveryOption, setDeliveryOption] = useState("self");
  const [distance, setDistance] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const vendorPincode = profile?.pincode || user?.pincode || "";
  const customerPincodeMatch = order?.address?.match(/\b\d{6}\b/);
  const customerPincode = customerPincodeMatch ? customerPincodeMatch[0] : "";

  // Dynamic calculations based on state (for live preview while packing)
  const subtotal = order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const isPacked = order?.status === "packed";
  const isUrgent = order?.deliveryType === "urgent";
  const displayDeliveryCharge = Math.round((isPacked ? (distance ? parseFloat(distance) * 10 + (isUrgent ? 50 : 0) : 0) : (order?.deliveryCharge || 0)) * 100) / 100;
  const displayTotal = Math.round((isPacked ? (subtotal + displayDeliveryCharge) : (order?.totalAmount || subtotal)) * 100) / 100;

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (vendorPincode.length === 6 && customerPincode.length === 6) {
      calculateDistance();
    }
  }, [vendorPincode, customerPincode]);

  const calculateDistance = async () => {
    setIsCalculating(true);
    setErrorMsg("");
    try {

      // 1. Fetch vendor coordinates
      const vendorUrl = `https://nominatim.openstreetmap.org/search?postalcode=${vendorPincode}&country=India&format=json`;
      const vendorRes = await fetch(vendorUrl, {
        headers: { "Accept": "application/json" }
      });
      if (!vendorRes.ok) throw new Error("Failed to reach geocoding service for vendor pincode.");
      const vendorData = await vendorRes.json();
      if (!vendorData || vendorData.length === 0) {
        throw new Error(`Vendor pincode (${vendorPincode}) not found.`);
      }
      const vendorCoords = {
        lat: parseFloat(vendorData[0].lat),
        lon: parseFloat(vendorData[0].lon)
      };

      // 2. Fetch customer coordinates
      const customerUrl = `https://nominatim.openstreetmap.org/search?postalcode=${customerPincode}&country=India&format=json`;
      const customerRes = await fetch(customerUrl, {
        headers: { "Accept": "application/json" }
      });
      if (!customerRes.ok) throw new Error("Failed to reach geocoding service for customer pincode.");
      const customerData = await customerRes.json();
      if (!customerData || customerData.length === 0) {
        throw new Error(`Customer pincode (${customerPincode}) not found in address.`);
      }
      const customerCoords = {
        lat: parseFloat(customerData[0].lat),
        lon: parseFloat(customerData[0].lon)
      };

      // 3. Haversine distance
      const R = 6371; // Earth's radius in KM
      const dLat = (customerCoords.lat - vendorCoords.lat) * Math.PI / 180;
      const dLon = (customerCoords.lon - vendorCoords.lon) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(vendorCoords.lat * Math.PI / 180) * Math.cos(customerCoords.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const rawDistance = R * c;

      // Approximate road distance (scale straight-line by 1.3)
      const approximatedDistance = Math.round(rawDistance * 1.3 * 10) / 10;
      setDistance(approximatedDistance.toString());
    } catch (err) {
      console.error("Distance calculation failed:", err);
      setErrorMsg(err.message || "Could not calculate distance. Please enter it manually.");
    } finally {
      setIsCalculating(false);
    }
  };

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

        <Row className="g-3">
          {/* Left Column: Client, Order, and Delivery Info / Setup */}
          <Col md={6}>
            {/* ── Customer info ── */}
            <div className="od-section" style={{ marginBottom: '1rem' }}>
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
            <div className="od-section" style={{ marginBottom: '1rem' }}>
              <p className="od-section-title">
                <FaClock size={12} /> Order Info
              </p>
              {[
                {
                  key: "Date & Time",
                  val: new Date(order.orderDate).toLocaleString("en-IN"),
                },
                { key: "Payment", val: order.paymentMethod },
                {
                  key: "Delivery Type",
                  val: (
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
                  )
                },
              ].map(({ key, val }) => (
                <div key={key} className="od-info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="od-info-key">{key}</span>
                  <span className="od-info-val">{val}</span>
                </div>
              ))}
            </div>

            {/* ── Delivery Info (Read-only after setup) ── */}
            {order.deliveryOption && order.status !== "packed" && (
              <div className="od-section" style={{ border: '1.5px solid #cbd5e1', background: '#f8fafc', marginBottom: '1rem' }}>
                <p className="od-section-title" style={{ color: '#475569' }}>
                  <FaTruck size={12} /> Delivery Info
                </p>
                {[
                  {
                    key: "Delivery Mode",
                    val: (
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
                    )
                  },
                  { key: "Distance", val: `${order.distance} KM` },
                  { key: "Delivery Charge", val: `₹${order.deliveryCharge}` },
                ].map(({ key, val }) => (
                  <div key={key} className="od-info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="od-info-key">{key}</span>
                    <span className="od-info-val">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Delivery Setup (Form when packed) ── */}
            {order.status === "packed" && (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1rem',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: '0 4px 12px rgba(52, 161, 41, 0.04)'
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaTruck size={14} /> Delivery Setup
                </p>

                {/* Check if store pincode is set in profile */}
                {!vendorPincode ? (
                  <p style={{ color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, margin: '0 0 10px' }}>
                    ⚠️ Please update your Store Pincode in your Profile page to enable automatic distance calculation.
                  </p>
                ) : null}
                
                <Row className="g-2">
                  <Col xs={6}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#166534', marginBottom: '6px', display: 'block' }}>
                      Delivery Option
                    </label>
                    <select
                      value={deliveryOption}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #a7f3d0',
                        fontSize: '0.8125rem',
                        outline: 'none',
                        background: '#fff',
                        fontWeight: 600,
                        color: '#166534'
                      }}
                    >
                      <option value="self">By Self</option>
                      <option value="delivery_partner">Delivery Partner</option>
                    </select>
                  </Col>

                  <Col xs={6}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#166534', marginBottom: '6px', display: 'block' }}>
                      Distance (in KM)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder={isCalculating ? "Calculating..." : "e.g. 2.5"}
                      value={distance}
                      onChange={(e) => {
                        setDistance(e.target.value);
                        setErrorMsg("");
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #a7f3d0',
                        fontSize: '0.8125rem',
                        outline: 'none',
                        fontWeight: 600
                      }}
                      disabled={isCalculating}
                    />
                  </Col>
                </Row>

                {isCalculating && (
                  <p style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 500, margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '0.85rem', height: '0.85rem', borderWidth: '1.5px', color: '#166534' }} />
                    Calculating distance automatically...
                  </p>
                )}

                {errorMsg && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 500, margin: '8px 0 0' }}>
                    ⚠️ {errorMsg}
                  </p>
                )}
              </div>
            )}
          </Col>

          {/* Right Column: Items List, Totals, and Action Controls */}
          <Col md={6}>
            {/* ── Items ── */}
            <div className="od-section" style={{ marginBottom: '1rem' }}>
              <p className="od-section-title">
                <FaBox size={12} /> Order Items
              </p>
              <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '10px' }}>
                {items.map((item, i) => (
                  <div key={i} className="od-item-row" style={{ padding: '8px 0' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="od-item-dot" />
                      <div>
                        <p className="od-item-name" style={{ margin: 0, fontSize: '0.875rem' }}>{item.name}</p>
                        <p className="od-item-qty" style={{ margin: 0, fontSize: '0.75rem' }}>
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <p className="od-item-price" style={{ margin: 0, fontSize: '0.875rem' }}>₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              
              {/* Highlight Delivery Charge inside items summary */}
              {displayDeliveryCharge > 0 && (
                <div className="od-info-row" style={{ borderBottom: 'none', padding: '10px 0 0', marginTop: '5px' }}>
                  <span className="od-info-key" style={{ color: '#0f766e', fontWeight: 700 }}>Delivery Charge</span>
                  <span className="od-info-val" style={{ color: '#0f766e', fontWeight: 700, background: '#f0fdfa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', border: '1px solid #ccfbf1' }}>+ ₹{displayDeliveryCharge}</span>
                </div>
              )}

              <div className="od-total-row" style={{ marginTop: '8px', padding: '10px 12px' }}>
                <span className="od-total-label">Total</span>
                <span className="od-total-val" style={{ fontSize: '1.15rem' }}>₹{displayTotal}</span>
              </div>
            </div>

            {/* ── Action controls ── */}
            <div className="od-actions" style={{ marginTop: '0.5rem' }}>
              {order.status === "new" && (
                <Row className="g-2">
                  <Col xs={6}>
                    <button
                      className="od-action-btn od-btn-accept w-100"
                      onClick={() =>
                        dispatch(
                          updateOrderStatus({ id: order.id, status: "accepted" }),
                        )
                      }
                      style={{ padding: '10px', fontSize: '0.875rem' }}
                    >
                      <FaCheck size={12} /> Accept
                    </button>
                  </Col>
                  <Col xs={6}>
                    <button
                      className="od-action-btn od-btn-reject w-100"
                      onClick={() =>
                        dispatch(
                          updateOrderStatus({ id: order.id, status: "cancelled" }),
                        )
                      }
                      style={{ padding: '10px', fontSize: '0.875rem' }}
                    >
                      <FaTimes size={12} /> Reject
                    </button>
                  </Col>
                </Row>
              )}
              {order.status === "accepted" && (
                <button
                  className="od-action-btn od-btn-packed w-100"
                  onClick={() =>
                    dispatch(updateOrderStatus({ id: order.id, status: "packed" }))
                  }
                  style={{ padding: '10px', fontSize: '0.875rem' }}
                >
                  <FaBox size={12} /> Mark as Packed
                </button>
              )}
              {order.status === "packed" && (
                <button
                  className="od-action-btn od-btn-deliver w-100"
                  onClick={() => {
                    if (!distance || isNaN(distance) || parseFloat(distance) <= 0) {
                      setErrorMsg("Please enter a valid positive distance in KM.");
                      return;
                    }
                    dispatch(
                      updateOrderStatus({
                        id: order.id,
                        status: "out_for_delivery",
                        deliveryOption,
                        distance: parseFloat(distance)
                      }),
                    );
                  }}
                  style={{ padding: '12px', fontSize: '0.875rem' }}
                >
                  <FaTruck size={14} /> Out for Delivery
                </button>
              )}
              {order.status === "out_for_delivery" && (
                <button
                  className="od-action-btn od-btn-done w-100"
                  onClick={() =>
                    dispatch(
                      updateOrderStatus({ id: order.id, status: "delivered" }),
                    )
                  }
                  style={{ padding: '10px', fontSize: '0.875rem' }}
                >
                  <FaCheckCircle size={12} /> Mark as Delivered
                </button>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OrderDetail;
