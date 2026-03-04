import { NavLink, Outlet } from "react-router-dom"
import "./app-layout.css"

type AppLayoutProps = {
  title: string
  userEmail: string
  onLogout: () => void
}

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tenant-management", label: "Corporate Approvals" },
  { to: "/billing-settlement", label: "Credits & Billing" },
  { to: "/integrations", label: "Provider Integrations" },
  { to: "/catalog-governance", label: "Lab Catalog" },
  { to: "/access-control", label: "Identity & Access" },
  { to: "/data-quality", label: "Data Quality" },
  { to: "/ai-governance", label: "AI Governance" },
  { to: "/observability", label: "Observability" },
  { to: "/compliance", label: "Compliance" },
  { to: "/support-overrides", label: "Support" },
]

export function AppLayout({ title, userEmail, onLogout }: AppLayoutProps) {
  return (
    <div className="superadmin-shell">
      <aside className="superadmin-sidebar">
        <h2>{title}</h2>
        <p>{userEmail}</p>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `superadmin-nav-item ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="superadmin-content">
        <div className="superadmin-topbar">
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
