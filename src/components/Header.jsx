import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { FaBell, FaUser, FaBars, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/authSlice'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'
import logo from '../assets/logo.png'

const Header = ({ toggleSidebar, sidebarOpen, isMobile }) => {
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const { user }        = useSelector((state) => state.auth)
  const { t }           = useLanguage()
  const [showNotif, setShowNotif] = useState(false)

  const notifications = [
    { id: 1, message: 'New order received #ORD-001', time: '5 mins ago'  },
    { id: 2, message: 'Low stock alert: Bread',       time: '10 mins ago' },
    { id: 3, message: 'New customer registered',      time: '1 hour ago'  },
  ]

  return (
    <>
      <style>{`
        /* ════════════════════════════════
           HEADER SHELL
        ════════════════════════════════ */
        .app-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 64px;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          z-index: 1040;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.375rem;
          gap: 1rem;
        }

        /* ════════════════════════════════
           LEFT — Brand + mobile toggle
        ════════════════════════════════ */
        .hdr-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* Toggle — only visible on mobile */
        .hdr-toggle {
          width: 38px; height: 38px;
          border: none; background: transparent;
          border-radius: 8px;
          display: none;            /* ✅ hidden on desktop */
          align-items: center; justify-content: center;
          cursor: pointer; color: #374151;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .hdr-toggle:hover { background: #f3f4f6; }
        .hdr-toggle svg {
          display: block !important;
          overflow: visible !important;
          width: 18px !important; height: 18px !important;
        }

        /* Show toggle only on mobile */
        @media (max-width: 768px) {
          .hdr-toggle { display: flex; }
        }

        /* Brand */
        .hdr-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hdr-logo {
          height: 46px;
          width: auto;
          object-fit: contain;
          display: block;
        }
        .hdr-brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #00204E, #34A129);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.4px;
          white-space: nowrap;
          line-height: 1;
        }

        /* ════════════════════════════════
           RIGHT — Lang + Notif + User
        ════════════════════════════════ */
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex-shrink: 0;
        }

        /* ── Generic icon button ── */
        .hdr-icon-btn {
          position: relative;
          width: 38px; height: 38px;
          border: none; background: transparent;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b5563;
          transition: background 0.2s;
        }
        .hdr-icon-btn:hover { background: #f3f4f6; }
        .hdr-icon-btn svg {
          display: block !important;
          overflow: visible !important;
        }

        /* ── Dropdown menus ── */
        .hdr-menu {
          border: none !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.13) !important;
          padding: 0 !important;
          margin-top: 8px !important;
          overflow: hidden;
          min-width: 300px;
        }
        .hdr-menu.sm { min-width: 190px; }

        .hdr-menu-head {
          padding: 0.875rem 1.125rem;
          font-size: 0.9rem; font-weight: 600; color: #111827;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }
        .hdr-notif-list { max-height: 260px; overflow-y: auto; }
        .hdr-notif-item {
          padding: 0.8rem 1.125rem;
          border-bottom: 1px solid #f9fafb;
          cursor: pointer; transition: background 0.15s;
        }
        .hdr-notif-item:hover { background: #f9fafb; }
        .hdr-notif-item:last-child { border-bottom: none; }
        .hdr-notif-msg {
          font-size: 0.8125rem; color: #1f2937;
          font-weight: 500; margin: 0 0 3px; line-height: 1.4;
        }
        .hdr-notif-time { font-size: 0.72rem; color: #9ca3af; }
        .hdr-menu-foot {
          padding: 0.625rem; text-align: center;
          border-top: 1px solid #f3f4f6; background: #fafafa;
        }
        .hdr-menu-foot a {
          font-size: 0.8125rem; color: #6366f1;
          font-weight: 500; text-decoration: none;
        }
        .hdr-menu-foot a:hover { text-decoration: underline; }

        /* ── User chip ── */
        .hdr-user-chip {
          display: flex; align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem 0.25rem 0.25rem;
          border: none; background: transparent;
          border-radius: 10px; cursor: pointer;
          transition: background 0.2s;
        }
        .hdr-user-chip:hover { background: #f3f4f6; }
        .hdr-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .hdr-user-avatar svg {
          display: block !important; overflow: visible !important;
        }
        .hdr-user-name {
          font-size: 0.8125rem; font-weight: 600;
          color: #111827; line-height: 1.25; white-space: nowrap;
        }
        .hdr-user-role {
          font-size: 0.7rem; color: #9ca3af;
          line-height: 1.25; white-space: nowrap;
        }

        /* ── User dropdown items ── */
        .hdr-usr-inner { padding: 0.375rem; }
        .hdr-usr-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem; color: #374151;
          cursor: pointer; transition: background 0.15s;
          border: none; background: none; width: 100%;
          text-align: left; border-radius: 8px;
          font-family: 'Poppins', sans-serif;
        }
        .hdr-usr-item:hover { background: #f3f4f6; }
        .hdr-usr-item.danger { color: #ef4444; }
        .hdr-usr-item.danger:hover { background: #fef2f2; }
        .hdr-usr-item svg {
          display: block !important;
          overflow: visible !important; flex-shrink: 0;
        }

        /* Hide Bootstrap caret */
        .no-caret::after { display: none !important; }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */
        @media (max-width: 576px) {
          .app-header    { padding: 0 0.875rem; }
          .hdr-brand-name { font-size: 1.1rem; }
          .hdr-user-text  { display: none; }
          .hdr-menu       { min-width: calc(100vw - 2rem); max-width: 320px; }
          .hdr-logo       { height: 30px; }
        }
      `}</style>

      <header className="app-header">

        {/* ════════════════════════════════
            LEFT: Toggle (mobile only) + Brand
        ════════════════════════════════ */}
        <div className="hdr-left">

          {/* ✅ Toggle button — hidden on desktop via CSS, shown on mobile */}
          <button
            className="hdr-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>

          {/* ✅ Brand — logo from assets/logo.png */}
          <div className="hdr-brand">
            <img
              src={logo}
              alt="Recomm"
              className="hdr-logo"
            />
            <span className="hdr-brand-name">Recomm</span>
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT: Lang + Notif + User
        ════════════════════════════════ */}
        <div className="hdr-right">

          {/* Language selector */}
          <LanguageSelector />

          {/* Notifications */}
          <Dropdown
            show={showNotif}
            onToggle={() => setShowNotif((v) => !v)}
            align="end"
          >
            <Dropdown.Toggle
              as="button"
              className="hdr-icon-btn no-caret"
              aria-label="Notifications"
            >
              <FaBell size={17} />
              {/* ✅ Badge removed */}
            </Dropdown.Toggle>

            <Dropdown.Menu className="hdr-menu">
              <div className="hdr-menu-head">
                🔔 {t('dashboard.notifications') || 'Notifications'}
              </div>
              <div className="hdr-notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className="hdr-notif-item">
                    <p className="hdr-notif-msg">{n.message}</p>
                    <span className="hdr-notif-time">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="hdr-menu-foot">
                <a href="#">View all notifications</a>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* User menu */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="hdr-user-chip no-caret"
              aria-label="Account menu"
            >
              <div className="hdr-user-avatar">
                <FaUser size={14} />
              </div>
              <div className="hdr-user-text">
                <div className="hdr-user-name">{user?.name || 'John Doe'}</div>
                <div className="hdr-user-role">Store Owner</div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="hdr-menu sm">
              <div className="hdr-usr-inner">
                <button
                  className="hdr-usr-item"
                  onClick={() => navigate('/store')}
                >
                  <FaUser size={13} />
                  My Store
                </button>
                <hr style={{ margin: '4px 0', borderColor: '#f3f4f6' }} />
                <button
                  className="hdr-usr-item danger"
                  onClick={() => {
                    dispatch(logout())
                    navigate('/login')
                  }}
                >
                  🚪 {t('common.logout') || 'Logout'}
                </button>
              </div>
            </Dropdown.Menu>
          </Dropdown>

        </div>
      </header>
    </>
  )
}

export default Header