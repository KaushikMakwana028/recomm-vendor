import { useState, useEffect, useCallback } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const SIDEBAR_W  = 260
const BREAKPOINT = 768

const Layout = ({ children }) => {
  const [isMobile, setIsMobile]       = useState(window.innerWidth <= BREAKPOINT)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > BREAKPOINT)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= BREAKPOINT
      setIsMobile(mobile)
      // ✅ Desktop: always open | Mobile: always closed on resize
      setSidebarOpen(!mobile)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ✅ Toggle only works on mobile
  const toggle = useCallback(() => {
    if (isMobile) setSidebarOpen((prev) => !prev)
  }, [isMobile])

  const close = useCallback(() => setSidebarOpen(false), [])

  // ✅ Desktop: always shift main by SIDEBAR_W
  // ✅ Mobile:  no shift (overlay mode)
  const mainMargin = !isMobile ? SIDEBAR_W : 0

  return (
    <>
      <style>{`
        .layout-main {
          padding-top: 64px;
          min-height: 100vh;
          background: #f8f9fa;
          transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .layout-inner {
          width: 100%;
          padding: 1.75rem;
        }
        @media (max-width: 768px)  { .layout-inner { padding: 1rem;     } }
        @media (max-width: 480px)  { .layout-inner { padding: 0.875rem; } }
      `}</style>

      <Header
        toggleSidebar={toggle}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={close}
      />

      <main
        className="layout-main"
        style={{ marginLeft: mainMargin }}
      >
        <div className="layout-inner">
          {children}
        </div>
      </main>
    </>
  )
}

export default Layout