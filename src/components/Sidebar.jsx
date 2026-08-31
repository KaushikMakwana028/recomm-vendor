import { NavLink } from 'react-router-dom'
import {
  FaHome, FaStore, FaBox, FaShoppingCart,
  FaWarehouse, FaUsers, FaTags, FaChartBar, FaCog,
} from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'

const SIDEBAR_W = 260

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { t } = useLanguage()

  const menu = [
    { path: '/dashboard',  icon: FaHome,         label: t('dashboard.title')  },
    { path: '/store',      icon: FaStore,        label: t('store.title')      },
    { path: '/products',   icon: FaBox,          label: t('products.title')   },
    { path: '/orders',     icon: FaShoppingCart, label: t('orders.title')     },
    { path: '/inventory',  icon: FaWarehouse,    label: t('inventory.title')  },
    { path: '/customers',  icon: FaUsers,        label: t('customers.title')  },
    { path: '/offers',     icon: FaTags,         label: t('offers.title')     },
    { path: '/reports',    icon: FaChartBar,     label: t('reports.title')    },
    { path: '/settings',   icon: FaCog,          label: t('settings.title')   },
  ]

  const sidebarStyle = {
    position:   'fixed',
    left:       0,
    top:        64,
    bottom:     0,
    width:      SIDEBAR_W,
    background: '#ffffff',
    borderRight:'1px solid #e5e7eb',
    zIndex:     1030,
    overflowY:  'auto',
    overflowX:  'hidden',
    transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease',
    transform:  isOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
    boxShadow:  isMobile && isOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
  }

  const overlayStyle = {
    position:      'fixed',
    inset:         0,
    top:           64,
    background:    'rgba(0,0,0,0.4)',
    zIndex:        1029,
    opacity:       isMobile && isOpen ? 1 : 0,
    pointerEvents: isMobile && isOpen ? 'auto' : 'none',
    transition:    'opacity 0.28s ease',
  }

  return (
    <>
      <style>{`
        /* ════════════════════════════════
           All classes use sidebar__ prefix
           to prevent collision with any
           page-level scoped styles
        ════════════════════════════════ */

        .app-sidebar::-webkit-scrollbar { width: 3px; }
        .app-sidebar::-webkit-scrollbar-thumb {
          background: #e5e7eb; border-radius: 4px;
        }

        /* ── Nav container ── */
        .sidebar__nav {
          padding: 0.875rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ── Nav link ── */
        .sidebar__link {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem;
          padding: 0.6875rem 0.875rem;
          border-radius: 10px;
          color: #6b7280;
          text-decoration: none !important;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          transition: background 0.18s ease, color 0.18s ease;
          white-space: nowrap;
          line-height: 1;
        }
        .sidebar__link:hover {
          background: rgba(0, 32, 78, 0.05);
          color: #00204E;
        }
        .sidebar__link.sidebar__active {
          background: linear-gradient(
            135deg,
            rgba(0, 32, 78, 0.12),
            rgba(52, 161, 41, 0.12)
          );
          color: #00204E;
          font-weight: 600;
        }

        /* ════════════════════════════════
           ICON WRAPPER
           Fully isolated — no generic
           class names that pages can clobber
        ════════════════════════════════ */
        .sidebar__icon-wrap {
          /* Fixed dimensions — cannot be collapsed */
          width: 20px !important;
          height: 20px !important;
          min-width: 20px !important;
          min-height: 20px !important;

          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;

          flex-shrink: 0 !important;
          line-height: 1 !important;

          /* Override Bootstrap svg { overflow: hidden } */
          overflow: visible !important;

          /* Never let parent color bleed collapse it */
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* ── SVG inside icon wrap ── */
        .sidebar__icon-wrap svg {
          display: block !important;
          width: 16px !important;
          height: 16px !important;
          min-width: 16px !important;
          min-height: 16px !important;
          overflow: visible !important;
          fill: currentColor !important;
          color: inherit !important;
          flex-shrink: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* ── Label ── */
        .sidebar__label {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          line-height: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      {/* Overlay — mobile only */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Sidebar panel */}
      <aside className="app-sidebar" style={sidebarStyle}>
        <nav className="sidebar__nav">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__active' : ''}`
              }
              onClick={() => { if (isMobile && onClose) onClose() }}
            >
              {/* ✅ sidebar__icon-wrap — unique, cannot be overridden by pages */}
              <span className="sidebar__icon-wrap">
                <item.icon size={16} />
              </span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar