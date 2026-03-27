import { useMemo } from "react"
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
}

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    to: "/corporate-accounts",
    label: "Corporates",
    icon: Building2,
    children: [
      { to: "/corporate-accounts", label: "All Corporates", icon: ClipboardCheck },
      { to: "/corporate-accounts/pending", label: "Pending Approvals", icon: ClipboardCheck },
      { to: "/corporate-accounts/active", label: "Active Corporates", icon: ClipboardCheck },
    ],
  },
  {
    to: "/doctors",
    label: "Doctors",
    icon: UserCheck,
    children: [
      { to: "/doctors", label: "All Doctors", icon: ClipboardCheck },
      { to: "/doctors/pending", label: "Pending Approvals", icon: ClipboardCheck },
      { to: "/doctors/kyc", label: "Pending KYC", icon: ClipboardCheck },
      { to: "/doctors/inactive", label: "Inactive", icon: ClipboardCheck },
      { to: "/doctors/active", label: "Active", icon: ClipboardCheck },
    ],
  },
  {
    to: "/consultations",
    label: "Consultations",
    icon: Stethoscope,
    children: [
      {
        to: "/consultations/tele",
        label: "Teleconsultation",
        icon: Stethoscope,
        children: [
          { to: "/consultations/tele/upcoming", label: "Upcoming Consultations", icon: ClipboardCheck },
          { to: "/consultations/tele/ongoing", label: "Ongoing Consultations", icon: ClipboardCheck },
          { to: "/consultations/tele/rescheduled", label: "Rescheduled Consultations", icon: ClipboardCheck },
        ],
      },
      {
        to: "/consultations/opd",
        label: "OPD Consultation",
        icon: Microscope,
        children: [
          { to: "/consultations/opd/upcoming", label: "Upcoming OPD", icon: ClipboardCheck },
          { to: "/consultations/opd/ongoing", label: "Ongoing OPD", icon: ClipboardCheck },
          { to: "/consultations/opd/rescheduled", label: "Rescheduled OPD", icon: ClipboardCheck },
        ],
      },
    ],
  },
  {
    to: "/products",
    label: "Products",
    icon: PackagePlus,
    children: [
      { to: "/products", label: "All Products", icon: ClipboardCheck },
      { to: "/products/categories", label: "All Categories", icon: ClipboardCheck },
      { to: "/products/active", label: "Active Products", icon: ClipboardCheck },
      { to: "/products/inactive", label: "Inactive Products", icon: ClipboardCheck },
      { to: "/products/inventory", label: "Inventory", icon: ClipboardCheck },
      { to: "/products/orders", label: "Orders", icon: ClipboardCheck },
    ],
  },
  { to: "/medicine", label: "Medicine", icon: Syringe },
  { to: "/cost-calculator", label: "Cost Calculator", icon: CreditCard },
  { to: "/programs-management", label: "Programs", icon: HandHeart },
  { to: "/billing-settlement", label: "Credits & Billing", icon: CreditCard },
  { to: "/catalog-governance", label: "Lab Catalog", icon: FlaskConical },
  { to: "/ai-governance", label: "AI Governance", icon: Bot },
  { to: "/platform-logs", label: "Error Logs", icon: Activity },
  { to: "/support-overrides", label: "Support", icon: HandHeart },
]

export function AppLayout({ title, userEmail }: AppLayoutProps) {
  const filteredNav = useMemo(() => navItems, [])
  const renderNavItems = (items: NavItem[], level = 0) =>
    items.map((item) => {
      const hasChildren = Boolean(item.children?.length)
      const isTopLevel = level === 0
      const linkClass = isTopLevel ? "superadmin-nav-item" : "superadmin-subnav-item"
      const link = (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `${linkClass} ${isActive ? "active" : ""}`}
        >
          {isTopLevel ? <item.icon size={15} /> : null}
          {item.label}
        </NavLink>
      )

      if (!hasChildren) {
        return isTopLevel ? (
          <div key={item.to} className="superadmin-nav-group">
            {link}
          </div>
        ) : (
          link
        )
      }

      if (isTopLevel) {
        return (
          <div key={item.to} className="superadmin-nav-group">
            {link}
            <div className="superadmin-subnav">{renderNavItems(item.children ?? [], level + 1)}</div>
          </div>
        )
      }

      return (
        <div key={item.to} className="superadmin-subnav-group">
          {link}
          <div className="superadmin-subnav nested">{renderNavItems(item.children ?? [], level + 1)}</div>
        </div>
      )
    })

  return (
    <div className="superadmin-shell">
      <aside className="superadmin-sidebar">
        <h2>{title}</h2>
        <p>{userEmail}</p>
        {/* search removed */}
        <nav>
          {renderNavItems(filteredNav)}
        </nav>
      </aside>

      <main className="superadmin-content">
        <Outlet />
      </main>
    </div>
  )
}
