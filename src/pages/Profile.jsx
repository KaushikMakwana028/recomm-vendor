import { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUser,
  FaEnvelope,
  FaMobileAlt,
  FaStore,
  FaSave,
  FaUniversity,
  FaCreditCard,
  FaMoneyCheckAlt,
  FaLandmark,
} from "react-icons/fa";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";

const ACCOUNT_TYPES = [
  { value: "current", label: "Current Account" },
  { value: "savings", label: "Savings Account" },
  { value: "business", label: "Business Account" },
  { value: "cash_credit", label: "Cash Credit Account" },
  { value: "overdraft", label: "Overdraft Account" },
  { value: "joint", label: "Joint Account" },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    shop_name: user?.shop_name || "",
    account_holder_name: user?.account_holder_name || "",
    bank_name: user?.bank_name || "",
    account_number: user?.account_number || "",
    ifsc_code: user?.ifsc_code || "",
    account_type: user?.account_type || "",
    branch_name: user?.branch_name || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log("Update profile:", formData);
    setIsEditing(false);
  };

  return (
    <Layout>
      <style>{`
        .profile-page {
          max-width: 800px;
          margin: 0 auto;
        }
        .profile-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #fff;
          font-size: 2.5rem;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }
        .profile-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .profile-role {
          font-size: 0.9rem;
          color: #6b7280;
          text-transform: capitalize;
        }
        .profile-card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .profile-section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f3f4f6;
        }
        .profile-field {
          margin-bottom: 1.5rem;
        }
        .profile-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .profile-label svg {
          color: #6366f1;
        }
        .profile-input {
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          font-family: 'Poppins', sans-serif;
          transition: all 0.2s;
        }
        .profile-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .profile-input:disabled {
          background: #f9fafb;
          color: #6b7280;
        }
        .profile-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f3f4f6;
        }
        .profile-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9375rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .profile-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: #fff;
        }
        .profile-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
        }
        .profile-btn-secondary {
          background: #f3f4f6;
          border: none;
          color: #374151;
        }
        .profile-btn-secondary:hover {
          background: #e5e7eb;
        }
      `}</style>

      <div className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <h1 className="profile-name">{user?.name || "User"}</h1>
          <p className="profile-role">{user?.role || "Vendor"}</p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Card className="profile-card">
            <h2 className="profile-section-title">
              {t("profile.personalInfo") || "Personal Information"}
            </h2>

            {/* Full Name */}
            <div className="profile-field">
              <label className="profile-label">
                <FaUser size={14} />
                Full Name
              </label>
              <Form.Control
                type="text"
                name="name"
                className="profile-input"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Email */}
            <div className="profile-field">
              <label className="profile-label">
                <FaEnvelope size={14} />
                Email Address
              </label>
              <Form.Control
                type="email"
                name="email"
                className="profile-input"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Mobile */}
            <div className="profile-field">
              <label className="profile-label">
                <FaMobileAlt size={14} />
                Mobile Number
              </label>
              <Form.Control
                type="tel"
                name="mobile"
                className="profile-input"
                value={formData.mobile}
                onChange={handleChange}
                disabled={true} // Mobile can't be changed
                required
              />
            </div>

            {/* Shop Name */}
            {user?.shop_name && (
              <div className="profile-field">
                <label className="profile-label">
                  <FaStore size={14} />
                  Shop Name
                </label>
                <Form.Control
                  type="text"
                  name="shop_name"
                  className="profile-input"
                  value={formData.shop_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            )}
          </Card>

          {/* Bank Details */}
          <Card className="profile-card">
            <h2 className="profile-section-title">
              {t("profile.bankDetails") || "Bank Details"}
            </h2>

            <Row>
              {/* Account Holder Name */}
              <Col md={6}>
                <div className="profile-field">
                  <label className="profile-label">
                    <FaUser size={14} />
                    Account Holder Name
                  </label>
                  <Form.Control
                    type="text"
                    name="account_holder_name"
                    className="profile-input"
                    value={formData.account_holder_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </Col>

              {/* Bank Name */}
              <Col md={6}>
                <div className="profile-field">
                  <label className="profile-label">
                    <FaUniversity size={14} />
                    Bank Name
                  </label>
                  <Form.Control
                    type="text"
                    name="bank_name"
                    className="profile-input"
                    value={formData.bank_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </Col>

              {/* Account Number */}
              <Col md={6}>
                <div className="profile-field">
                  <label className="profile-label">
                    <FaCreditCard size={14} />
                    Account Number
                  </label>
                  <Form.Control
                    type="text"
                    name="account_number"
                    className="profile-input"
                    value={formData.account_number}
                    onChange={handleChange}
                    disabled={!isEditing}
                    inputMode="numeric"
                  />
                </div>
              </Col>

              {/* IFSC Code */}
              <Col md={6}>
                <div className="profile-field">
                  <label className="profile-label">
                    <FaMoneyCheckAlt size={14} />
                    IFSC Code
                  </label>
                  <Form.Control
                    type="text"
                    name="ifsc_code"
                    className="profile-input"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{ textTransform: "uppercase" }}
                    maxLength={11}
                  />
                </div>
              </Col>

              {/* Account Type - dropdown */}
              <Col md={6}>
                <div className="profile-field">
                  <label className="profile-label">
                    <FaCreditCard size={14} />
                    Account Type
                  </label>
                  <Form.Select
                    name="account_type"
                    className="profile-input"
                    value={formData.account_type}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Account Type</option>
                    {ACCOUNT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              {/* Branch Name */}
              <Col md={6}>
                <div className="profile-field">
                  <label className="profile-label">
                    <FaLandmark size={14} />
                    Branch Name
                  </label>
                  <Form.Control
                    type="text"
                    name="branch_name"
                    className="profile-input"
                    value={formData.branch_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </Col>
            </Row>

            {/* Actions */}
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    className="profile-btn profile-btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        mobile: user?.mobile || "",
                        shop_name: user?.shop_name || "",
                        account_holder_name: user?.account_holder_name || "",
                        bank_name: user?.bank_name || "",
                        account_number: user?.account_number || "",
                        ifsc_code: user?.ifsc_code || "",
                        account_type: user?.account_type || "",
                        branch_name: user?.branch_name || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="profile-btn profile-btn-primary"
                  >
                    <FaSave size={14} />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  className="profile-btn profile-btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>
        </Form>
      </div>
    </Layout>
  );
};

export default Profile;
