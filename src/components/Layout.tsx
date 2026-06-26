import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_SECTIONS = [
  {
    title: 'Getting Started',
    links: [
      { to: '/', label: 'Home', icon: '~' },
    ],
  },
  {
    title: 'Builders',
    links: [
      { to: '/invoice', label: 'Invoice Builder', icon: '#' },
      { to: '/credit-note', label: 'Credit Note', icon: '%' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { to: '/data-types', label: 'Data Types', icon: '{' },
      { to: '/components', label: 'Components Gallery', icon: '<' },
    ],
  },
  {
    title: 'Extensions',
    links: [
      { to: '/dian', label: 'DIAN (Colombia)', icon: '!' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/tools', label: 'Utilities', icon: '*' },
    ],
  },
]

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay sidebar-overlay--visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <h2>ubl-builder</h2>
          <span>v1.4.5 &middot; UBL 2.1</span>
        </div>
        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="sidebar__section-title">{section.title}</div>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sidebar__link-icon">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
