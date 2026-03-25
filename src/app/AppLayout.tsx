import { useMemo, useState } from "react"
import {
  Activity,
  Bot,
  Building2,
  Cable,
  ClipboardCheck,
  CreditCard,
  Database,
  FlaskConical,
  HandHeart,
  IdCard,
  LayoutDashboard,
  Microscope,
  PackagePlus,
  Search,
  Shield,
  Stethoscope,
  Syringe,
  UserCheck,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import "./app-layout.css"

type AppLayoutProps = {
  title: string
  userEmail: string
  onLogout: () => void
}

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/corporate-accounts", label: "Corporate Accounts", icon: Building2 },
  { to: "/doctor-management", label: "Doctors", icon: UserCheck },
  { to: "/doctor-products", label: "Doctor Products", icon: PackagePlus },
  { to: "/pharmacy-operations", label: "Pharmacy Ops", icon: Syringe },
  { to: "/platform-logs", label: "Platform Logs", icon: Activity },
  { to: "/teleconsult-analytics", label: "Teleconsult Analytics", icon: Stethoscope },
  { to: "/doctor-analytics", label: "Doctor Analytics", icon: Users },
  { to: "/opd-analytics", label: "OPD Analytics", icon: Microscope },
  { to: "/programs-management", label: "Programs", icon: HandHeart },
  { to: "/tenant-management", label: "Corporate Approvals", icon: ClipboardCheck },
  { to: "/billing-settlement", label: "Credits & Billing", icon: CreditCard },
  { to: "/integrations", label: "Provider Integrations", icon: Cable },
  { to: "/catalog-governance", label: "Lab Catalog", icon: FlaskConical },
  { to: "/access-control", label: "Identity & Access", icon: IdCard },
  { to: "/data-quality", label: "Data Quality", icon: Database },
  { to: "/ai-governance", label: "AI Governance", icon: Bot },
  { to: "/observability", label: "Observability", icon: Activity },
  { to: "/compliance", label: "Compliance", icon: Shield },
  { to: "/support-overrides", label: "Support", icon: HandHeart },
]

export function AppLayout({ title, userEmail, onLogout }: AppLayoutProps) {
  const [navQuery, setNavQuery] = useState("")
  const currentDateTime = useMemo(
    () =>
      new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  )

  const filteredNav = useMemo(() => {
    const query = navQuery.trim().toLowerCase()
    if (!query) return navItems
    return navItems.filter((item) => item.label.toLowerCase().includes(query))
  }, [navQuery])

  return (
    <div className="superadmin-shell">
      <aside className="superadmin-sidebar">
        <h2>{title}</h2>
        <p>{userEmail}</p>
        <div className="superadmin-search">
          <Search size={14} />
          <input
            placeholder="Search modules"
            value={navQuery}
            onChange={(event) => setNavQuery(event.target.value)}
          />
        </div>
        <section className="superadmin-illustration-card">
          <div className="superadmin-orbit">
            <i />
            <i />
            <i />
          </div>
          <div>
            <strong>Command Room Live</strong>
            <small>24 data streams monitored in real time</small>
          </div>
        </section>
        <nav>
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `superadmin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="superadmin-content">
        <div className="superadmin-topbar">
          <div className="superadmin-topbar-left">
            <span className="status-chip"><i />Live monitoring</span>
            <span className="status-chip neutral">{currentDateTime}</span>
          </div>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
