import { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  FaStore,
  FaClock,
  FaMapMarkerAlt,
  FaCamera,
  FaSave,
  FaTimes,
  FaUniversity,
  FaCreditCard,
  FaMoneyCheckAlt,
  FaLandmark,
  FaUser,
} from "react-icons/fa";
import {
  fetchProfile,
  updateProfile,
  clearStoreError,
} from "../redux/storeSlice";
import { useLanguage } from "../contexts/LanguageContext";
import Layout from "../components/Layout";

const ACCOUNT_TYPES = [
  { value: "current", label: "Current Account" },
  { value: "savings", label: "Savings Account" },
  { value: "business", label: "Business Account" },
  { value: "cash_credit", label: "Cash Credit Account" },
  { value: "overdraft", label: "Overdraft Account" },
  { value: "joint", label: "Joint Account" },
];

const MyStore = () => {
  // Redux state
  const dispatch = useDispatch();
  const { profile, loading, saving, error, saveError } = useSelector(
    (state) => state.store,
  );
  const { t } = useLanguage();

  // Local state
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    shop_name: "",
    owner_name: "",
    address: "",
    pincode: "",
    contact_number: "",
    gst_number: "",
    opening_time: "",
    closing_time: "",
    deliveryRadius: 5,
    store_photo: null, // File object for upload
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_type: "",
    branch_name: "",
  });

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        shop_name: profile.shop_name || "",
        owner_name: profile.owner_name || "",
        address: profile.address || "",
        pincode: profile.pincode || "",
        contact_number: profile.contact_number || "",
        gst_number: profile.gst_number || "",
        opening_time: profile.opening_time
          ? profile.opening_time.slice(0, 5)
          : "", // Convert HH:MM:SS to HH:MM
        closing_time: profile.closing_time
          ? profile.closing_time.slice(0, 5)
          : "", // Convert HH:MM:SS to HH:MM
        deliveryRadius: 5, // This might need to be added to your API
        store_photo: null,
        account_holder_name: profile.account_holder_name || "",
        bank_name: profile.bank_name || "",
        account_number: profile.account_number || "",
        ifsc_code: profile.ifsc_code || "",
        account_type: profile.account_type || "",
        branch_name: profile.branch_name || "",
      });

      // Set image preview if profile has store photo
      if (profile.store_photo) {
        setImagePreview(profile.store_photo);
      }
    }
  }, [profile]);

  // Show success message when save is successful
  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearStoreError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Update form data with file
    setFormData((prev) => ({ ...prev, store_photo: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for file upload
    const submitData = new FormData();

    // Add all form fields except deliveryRadius (if not supported by API)
    Object.keys(formData).forEach((key) => {
      if (key === "store_photo" && formData[key]) {
        submitData.append("store_photo", formData[key]);
      } else if (key !== "store_photo" && key !== "deliveryRadius") {
        submitData.append(key, formData[key]);
      }
    });

    // Dispatch update action — only show success (and only re-fetch)
    // once the API call has actually resolved successfully. Re-fetching
    // pulls the real saved data back from the server so the UI reflects
    // what was actually persisted, not just an optimistic local merge.
    try {
      await dispatch(updateProfile(submitData)).unwrap();
      await dispatch(fetchProfile()).unwrap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // saveError is already set in the store by the rejected case —
      // nothing else to do here, the error alert will show it.
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        shop_name: profile.shop_name || "",
        owner_name: profile.owner_name || "",
        address: profile.address || "",
        contact_number: profile.contact_number || "",
        gst_number: profile.gst_number || "",
        opening_time: profile.opening_time
          ? profile.opening_time.slice(0, 5)
          : "",
        closing_time: profile.closing_time
          ? profile.closing_time.slice(0, 5)
          : "",
        deliveryRadius: 5,
        store_photo: null,
        account_holder_name: profile.account_holder_name || "",
        bank_name: profile.bank_name || "",
        account_number: profile.account_number || "",
        ifsc_code: profile.ifsc_code || "",
        account_type: profile.account_type || "",
        branch_name: profile.branch_name || "",
      });
      setImagePreview(profile.store_photo || null);
    }
    // Clear any errors
    dispatch(clearStoreError());
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem", color: "#00204E" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading store information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error Loading Store</h4>
              <p>{error}</p>
              <button
                className="btn btn-outline-danger"
                onClick={() => dispatch(fetchProfile())}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mask account number for the preview panel (show only last 4 digits)
  const maskedAccountNumber = formData.account_number
    ? `••••${formData.account_number.slice(-4)}`
    : "—";

  const accountTypeLabel =
    ACCOUNT_TYPES.find((t) => t.value === formData.account_type)?.label || "—";

  return (
    <Layout>
      {/* ── Scoped styles ── */}
      <style>{`
        /* ════════════════════════════════
           PAGE HEADER
        ════════════════════════════════ */
        .ms-page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #00204E;
          margin: 0 0 4px;
        }
        .ms-page-sub {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        /* ════════════════════════════════
           SECTION CARDS
        ════════════════════════════════ */
        .ms-card {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.06) !important;
          background: #fff;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .ms-card:last-child { margin-bottom: 0; }

        .ms-card-head {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 1.125rem 1.375rem;
          border-bottom: 1px solid #f3f4f6;
          background: #fff;
        }
        .ms-card-head-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg,#00204E,#34A129);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .ms-card-head-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #00204E;
          margin: 0;
        }
        .ms-card-head-title span {
          display: block;
          font-size: 0.75rem;
          font-weight: 400;
          color: #9ca3af;
          margin-top: 2px;
        }
        .ms-card-body { padding: 1.375rem; }

        /* ════════════════════════════════
           FORM ELEMENTS
        ════════════════════════════════ */
        .ms-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }
        .ms-label span {
          font-size: 0.75rem;
          font-weight: 400;
          color: #9ca3af;
          margin-left: 4px;
        }
        .ms-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.875rem;
          font-family: 'Poppins', sans-serif;
          color: #111827;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .ms-input:focus {
          border-color: #34A129;
          box-shadow: 0 0 0 3px rgba(52,161,41,0.1);
        }
        select.ms-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.875rem center;
          padding-right: 2.25rem;
        }
        textarea.ms-input { resize: vertical; min-height: 90px; }

        /* ════════════════════════════════
           IMAGE UPLOAD
        ════════════════════════════════ */
        .ms-upload-zone {
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
          overflow: hidden;
        }
        .ms-upload-zone:hover {
          border-color: #34A129;
          background: #dcfce7;
        }
        .ms-upload-zone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          z-index: 2;
        }
        .ms-upload-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          color: #6b7280;
          font-size: 1.25rem;
        }
        .ms-upload-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin: 0 0 4px;
        }
        .ms-upload-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }

        /* Filled state — photo already chosen, shown as a cover image
           with a hover overlay instead of a separate duplicate preview */
        .ms-upload-zone.has-image {
          padding: 0;
          border-style: solid;
          height: 180px;
        }
        .ms-upload-zone.has-image .ms-upload-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }
        .ms-upload-zone.has-image .ms-upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 32, 78, 0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #fff;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ms-upload-zone.has-image:hover .ms-upload-overlay {
          opacity: 1;
        }
        .ms-upload-overlay span {
          font-size: 0.8125rem;
          font-weight: 600;
        }

        /* ════════════════════════════════
           TIMINGS DISPLAY
        ════════════════════════════════ */
        .ms-time-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: #f0f9ff;
          border-radius: 12px;
          margin-top: 1rem;
        }
        .ms-time-block {
          text-align: center;
        }
        .ms-time-val {
          font-size: 1.375rem;
          font-weight: 700;
          color: #00204E;
          line-height: 1;
          margin: 0 0 4px;
        }
        .ms-time-lbl {
          font-size: 0.7rem;
          color: #9ca3af;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .ms-time-sep {
          font-size: 1.25rem;
          color: #d1d5db;
          font-weight: 300;
        }

        /* ════════════════════════════════
           DELIVERY RADIUS
        ════════════════════════════════ */
        .ms-radius-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ms-radius-wrap input[type="range"] {
          flex: 1;
          accent-color: #34A129;
          height: 6px;
        }
        .ms-radius-badge {
          min-width: 68px;
          padding: 6px 14px;
          background: linear-gradient(135deg, #00204E, #34A129);
          color: #fff;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 700;
          text-align: center;
          flex-shrink: 0;
        }
        .ms-radius-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 8px;
        }

        /* ════════════════════════════════
           BANK BADGE (form section hint)
        ════════════════════════════════ */
        .ms-bank-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f0f9ff;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: #475569;
          margin-bottom: 1.125rem;
        }
        .ms-bank-note svg {
          color: #34A129;
          margin-top: 2px;
          flex-shrink: 0;
        }

        /* ════════════════════════════════
           PREVIEW CARD (right column)
        ════════════════════════════════ */
        .ms-preview-card {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 10px rgba(0,32,78,0.06) !important;
          background: #fff;
          overflow: hidden;
          position: sticky;
          top: calc(64px + 1.75rem);   /* header + layout padding */
        }
        .ms-preview-card-head {
          padding: 1.125rem 1.375rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #00204E;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ms-preview-card-head::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg,#00204E,#34A129);
          border-radius: 2px;
          display: inline-block;
        }
        .ms-preview-body { padding: 1.375rem; }
        .ms-preview-large {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1rem;
          border: 1px solid #f3f4f6;
        }
        .ms-preview-store-name {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #00204E;
          margin: 0 0 12px;
        }
        .ms-preview-group-lbl {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9ca3af;
          margin: 14px 0 4px;
        }
        .ms-preview-group-lbl:first-child { margin-top: 0; }
        .ms-preview-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f9fafb;
          font-size: 0.8125rem;
        }
        .ms-preview-row:last-child { border-bottom: none; }
        .ms-preview-key {
          font-weight: 600;
          color: #6b7280;
          min-width: 80px;
          flex-shrink: 0;
        }
        .ms-preview-val {
          color: #111827;
          font-weight: 500;
          word-break: break-word;
        }
        .ms-preview-placeholder {
          text-align: center;
          padding: 2rem 1rem;
        }
        .ms-preview-placeholder-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: #f0f9ff;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          color: #34A129;
          font-size: 1.5rem;
        }

        /* ════════════════════════════════
           ACTION BUTTONS
        ════════════════════════════════ */
        .ms-action-bar {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 0.5rem;
        }
        .ms-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.625rem 1.5rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ms-btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        .ms-btn-cancel:hover {
          background: #e5e7eb;
        }
        .ms-btn-save {
          background: linear-gradient(135deg, #00204E, #34A129);
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,32,78,0.3);
        }
        .ms-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,32,78,0.4);
        }
        .ms-btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* ════════════════════════════════
           SUCCESS ALERT
        ════════════════════════════════ */
        .ms-alert {
          border: none;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          background: #dcfce7;
          color: #166534;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
        }

        /* ════════════════════════════════
           ERROR ALERT
        ════════════════════════════════ */
        .ms-error-alert {
          border: none;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          background: #fef2f2;
          color: #991b1b;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
        }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */
        @media (max-width: 991px) {
          .ms-preview-card { position: static; }
        }
        @media (max-width: 576px) {
          .ms-card-body    { padding: 1rem; }
          .ms-preview-body { padding: 1rem; }
        }
      `}</style>

      {/* ── Page Heading ── */}
      <motion.div
        className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="ms-page-title">{t("store.title") || "My Store"}</h2>
          <p className="ms-page-sub">
            Manage your store information and settings
          </p>
        </div>
      </motion.div>

      {/* ── Success Alert ── */}
      {success && (
        <motion.div
          className="ms-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅{" "}
          {t("store.storeUpdated") || "Store information updated successfully!"}
          <button
            onClick={() => setSuccess(false)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#166534",
              fontSize: "1rem",
            }}
          >
            ×
          </button>
        </motion.div>
      )}

      {/* ── Error Alert ── */}
      {saveError && (
        <motion.div
          className="ms-error-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {saveError}
          <button
            onClick={() => dispatch(clearStoreError())}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#991b1b",
              fontSize: "1rem",
            }}
          >
            ×
          </button>
        </motion.div>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* ══════════════════════════════
              LEFT COLUMN — form cards
          ══════════════════════════════ */}
          <Col lg={8}>
            {/* ── Store Information ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
            >
              <div className="ms-card">
                <div className="ms-card-head">
                  <div className="ms-card-head-icon">
                    <FaStore />
                  </div>
                  <h5 className="ms-card-head-title">Store Information</h5>
                </div>
                <div className="ms-card-body">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.storeName") || "Store Name"}
                        </label>
                        <input
                          className="ms-input"
                          type="text"
                          name="shop_name"
                          value={formData.shop_name}
                          onChange={handleChange}
                          placeholder="e.g. Fresh Mart"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.ownerName") || "Owner Name"}
                        </label>
                        <input
                          className="ms-input"
                          type="text"
                          name="owner_name"
                          value={formData.owner_name}
                          onChange={handleChange}
                          placeholder="e.g. John Doe"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Full Name</label>
                        <input
                          className="ms-input"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Sahil Maheriya"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Email</label>
                        <input
                          className="ms-input"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. sahil@gmail.com"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.address") || "Address"}
                        </label>
                        <textarea
                          className="ms-input"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Full store address..."
                          rows={3}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.contactNumber") || "Contact Number"}
                        </label>
                        <input
                          className="ms-input"
                          type="tel"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.gst") || "GST Number"}
                          <span>(Optional)</span>
                        </label>
                        <input
                          className="ms-input"
                          type="text"
                          name="gst_number"
                          value={formData.gst_number}
                          onChange={handleChange}
                          placeholder="e.g. 27AAPFU0939F1ZV"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <label className="ms-label">
                          Pincode
                        </label>
                        <input
                          className="ms-input"
                          type="text"
                          name="pincode"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            handleChange({ target: { name: 'pincode', value: val } });
                          }}
                          placeholder="Enter 6-digit Pincode"
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Image Upload — single zone, shows the photo itself once chosen */}
                    <Col md={12}>
                      <label className="ms-label">
                        {t("store.storePhoto") || "Store Photo"}
                      </label>
                      <div
                        className={`ms-upload-zone ${imagePreview ? "has-image" : ""}`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview ? (
                          <>
                            <div
                              className="ms-upload-bg"
                              style={{
                                backgroundImage: `url(${imagePreview})`,
                              }}
                            />
                            <div className="ms-upload-overlay">
                              <FaCamera size={18} />
                              <span>Click to change photo</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="ms-upload-icon">
                              <FaCamera />
                            </div>
                            <p className="ms-upload-text">
                              Click to upload store photo
                            </p>
                            <p className="ms-upload-hint">
                              PNG, JPG up to 5 MB
                            </p>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </motion.div>

            {/* ── Bank Details ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
            >
              <div className="ms-card">
                <div className="ms-card-head">
                  <div className="ms-card-head-icon">
                    <FaUniversity />
                  </div>
                  <h5 className="ms-card-head-title">
                    Bank Details
                    <span>Used for payouts and settlements</span>
                  </h5>
                </div>
                <div className="ms-card-body">
                  <div className="ms-bank-note">
                    <FaMoneyCheckAlt size={14} />
                    <span>
                      Make sure the account holder name matches your bank
                      records exactly to avoid payout failures.
                    </span>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Account Holder Name</label>
                        <input
                          className="ms-input"
                          type="text"
                          name="account_holder_name"
                          value={formData.account_holder_name}
                          onChange={handleChange}
                          placeholder="e.g. Sahil Maheriya"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Bank Name</label>
                        <input
                          className="ms-input"
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          placeholder="e.g. HDFC Bank"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Account Number</label>
                        <input
                          className="ms-input"
                          type="text"
                          name="account_number"
                          value={formData.account_number}
                          onChange={handleChange}
                          placeholder="e.g. 000123456789"
                          inputMode="numeric"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">IFSC Code</label>
                        <input
                          className="ms-input"
                          type="text"
                          name="ifsc_code"
                          value={formData.ifsc_code}
                          onChange={handleChange}
                          placeholder="e.g. HDFC0001234"
                          style={{ textTransform: "uppercase" }}
                          maxLength={11}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Account Type</label>
                        <select
                          className="ms-input"
                          name="account_type"
                          value={formData.account_type}
                          onChange={handleChange}
                        >
                          <option value="">Select account type</option>
                          {ACCOUNT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">Branch Name</label>
                        <input
                          className="ms-input"
                          type="text"
                          name="branch_name"
                          value={formData.branch_name}
                          onChange={handleChange}
                          placeholder="e.g. Navrangpura Branch"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </div>
            </motion.div>

            {/* ── Store Timings ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
            >
              <div className="ms-card">
                <div className="ms-card-head">
                  <div className="ms-card-head-icon">
                    <FaClock />
                  </div>
                  <h5 className="ms-card-head-title">Store Timings</h5>
                </div>
                <div className="ms-card-body">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.openingTime") || "Opening Time"}
                        </label>
                        <input
                          className="ms-input"
                          type="time"
                          name="opening_time"
                          value={formData.opening_time}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <label className="ms-label">
                          {t("store.closingTime") || "Closing Time"}
                        </label>
                        <input
                          className="ms-input"
                          type="time"
                          name="closing_time"
                          value={formData.closing_time}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Live timing preview */}
                    {(formData.opening_time || formData.closing_time) && (
                      <Col md={12}>
                        <div className="ms-time-display">
                          <div className="ms-time-block">
                            <p className="ms-time-val">
                              {formData.opening_time || "--:--"}
                            </p>
                            <p className="ms-time-lbl">Opens</p>
                          </div>
                          <span className="ms-time-sep">→</span>
                          <div className="ms-time-block">
                            <p className="ms-time-val">
                              {formData.closing_time || "--:--"}
                            </p>
                            <p className="ms-time-lbl">Closes</p>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </div>
            </motion.div>

            {/* ── Delivery Settings ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.24 }}
            >
              <div className="ms-card" style={{ marginBottom: 0 }}>
                <div className="ms-card-head">
                  <div className="ms-card-head-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <h5 className="ms-card-head-title">Delivery Settings</h5>
                </div>
                <div className="ms-card-body">
                  <label className="ms-label">
                    {t("store.deliveryRadius") || "Delivery Radius"}
                  </label>
                  <div className="ms-radius-wrap">
                    <input
                      type="range"
                      name="deliveryRadius"
                      value={formData.deliveryRadius}
                      onChange={handleChange}
                      min="2"
                      max="10"
                      step="1"
                    />
                    <div className="ms-radius-badge">
                      {formData.deliveryRadius} km
                    </div>
                  </div>
                  <p className="ms-radius-hint">
                    Select delivery radius from 2 km to 10 km
                  </p>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* ══════════════════════════════
              RIGHT COLUMN — live preview
          ══════════════════════════════ */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="ms-preview-card">
                <div className="ms-preview-card-head">Store Preview</div>
                <div className="ms-preview-body">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Store"
                      className="ms-preview-large"
                    />
                  ) : (
                    <div className="ms-preview-placeholder">
                      <div className="ms-preview-placeholder-icon">
                        <FaStore />
                      </div>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        Upload a photo to preview
                      </p>
                    </div>
                  )}

                  <h5 className="ms-preview-store-name">
                    {formData.shop_name || "Store Name"}
                  </h5>

                  {[
                    { key: "Owner", val: formData.owner_name || "—" },
                    { key: "Contact", val: formData.contact_number || "—" },
                    { key: "Email", val: formData.email || "—" },
                    { key: "Address", val: formData.address || "—" },
                    { key: "Pincode", val: formData.pincode || "—" },
                    {
                      key: "Timings",
                      val: `${formData.opening_time || "--:--"} → ${formData.closing_time || "--:--"}`,
                    },
                    {
                      key: "Delivery",
                      val: `${formData.deliveryRadius} km radius`,
                    },
                    ...(formData.gst_number
                      ? [{ key: "GST", val: formData.gst_number }]
                      : []),
                  ].map(({ key, val }) => (
                    <div className="ms-preview-row" key={key}>
                      <span className="ms-preview-key">{key}</span>
                      <span className="ms-preview-val">{val}</span>
                    </div>
                  ))}

                  {(formData.bank_name || formData.account_number) && (
                    <>
                      <p className="ms-preview-group-lbl">Bank Details</p>
                      {[
                        { key: "Bank", val: formData.bank_name || "—" },
                        {
                          key: "Holder",
                          val: formData.account_holder_name || "—",
                        },
                        { key: "A/C No.", val: maskedAccountNumber },
                        { key: "IFSC", val: formData.ifsc_code || "—" },
                        { key: "Type", val: accountTypeLabel },
                        { key: "Branch", val: formData.branch_name || "—" },
                      ].map(({ key, val }) => (
                        <div className="ms-preview-row" key={key}>
                          <span className="ms-preview-key">{key}</span>
                          <span className="ms-preview-val">{val}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* ── Action Buttons ── */}
        <motion.div
          className="ms-action-bar mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <button
            type="button"
            className="ms-btn ms-btn-cancel"
            onClick={handleReset}
            disabled={saving}
          >
            <FaTimes size={13} />
            {t("common.cancel") || "Reset"}
          </button>
          <button
            type="submit"
            className="ms-btn ms-btn-save"
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  style={{
                    width: "0.875rem",
                    height: "0.875rem",
                    borderWidth: "0.15em",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <FaSave size={13} />
                {t("store.updateStore") || "Save Changes"}
              </>
            )}
          </button>
        </motion.div>
      </Form>
    </Layout>
  );
};

export default MyStore;
