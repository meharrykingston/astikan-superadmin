import { useEffect, useMemo, useState } from "react"
import { Plus, X } from "lucide-react"
import "../operations.css"
import { fetchCompaniesAdmin, registerCompany, type CompanyAdminRecord, type CompanyAdminMeta } from "../../services/companiesAdminApi"

type CorporateAccountsPageProps = {
  initialFilter?: "pending" | "active" | "all"
}

export function CorporateAccountsPage({ initialFilter }: CorporateAccountsPageProps) {
  const [companies, setCompanies] = useState<CompanyAdminRecord[]>([])
  const [meta, setMeta] = useState<CompanyAdminMeta>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter ?? "")

  const [showRegister, setShowRegister] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    hrName: "",
    email: "",
    phone: "",
    billingEmail: "",
    employeeCount: "",
    plan: "starter",
  })

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter)
      setPage(1)
    }
  }, [initialFilter])

  const loadPage = (targetPage: number) => {
    let active = true
    setLoading(true)
    const offset = (targetPage - 1) * pageSize
    void fetchCompaniesAdmin(pageSize, offset)
      .then((payload) => {
        if (!active) return
        setCompanies(payload.rows)
        setMeta(payload.meta)
        setError("")
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load corporates")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }

  useEffect(() => loadPage(page), [page])

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / pageSize))
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, meta.total || companies.length)

  const filteredCompanies = useMemo(() => {
    if (!statusFilter || statusFilter === "all") return companies
    const normalized = statusFilter.toLowerCase()
    return companies.filter((company) => String(company.status ?? "").toLowerCase() === normalized)
  }, [companies, statusFilter])

  const handleRegister = async () => {
    if (!formData.name.trim()) return
    try {
      setSaving(true)
      await registerCompany({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        contact_name: formData.hrName.trim() || undefined,
        contact_phone: formData.phone.trim() || undefined,
        billing_email: formData.billingEmail.trim() || undefined,
        employee_count: formData.employeeCount ? Number(formData.employeeCount) : undefined,
        plan: formData.plan,
      })
      setShowRegister(false)
      setFormData({
        name: "",
        hrName: "",
        email: "",
        phone: "",
        billingEmail: "",
        employeeCount: "",
        plan: "starter",
      })
      loadPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register corporate")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="ops-page">
      <header className="ops-head ops-head-row">
        <div>
          <h1>Corporates</h1>
          <p className="ops-kpi-sub">Manage corporate accounts, HR contacts, and onboarding status.</p>
        </div>
        <button
          type="button"
          className="ops-icon-btn"
          onClick={() => setShowRegister(true)}
          aria-label="Register corporate"
        >
          <Plus size={18} />
        </button>
      </header>

      <section className="ops-grid ops-grid--4">
        <article className="ops-card">
          <h2>All Corporates</h2>
          <div className="ops-kpi">{meta.total}</div>
          <div className="ops-kpi-sub">Total onboarded</div>
        </article>
        <article className="ops-card">
          <h2>Active Corporates</h2>
          <div className="ops-kpi">{meta.active}</div>
          <div className="ops-kpi-sub">Currently live</div>
        </article>
        <article className="ops-card">
          <h2>Pending Verification</h2>
          <div className="ops-kpi">{meta.pending}</div>
          <div className="ops-kpi-sub">Awaiting review</div>
        </article>
        <article className="ops-card">
          <h2>Inactive</h2>
          <div className="ops-kpi">{meta.inactive}</div>
          <div className="ops-kpi-sub">Temporarily disabled</div>
        </article>
      </section>

      <section className="ops-table-wrap">
        {loading ? (
          <div className="ops-loader">
            <div className="ops-spinner" />
            <span>Loading corporates...</span>
          </div>
        ) : null}
        {!loading && error && <div className="ops-kpi-sub">{error}</div>}
        {initialFilter ? (
          <div className="ops-filter-pill">Showing: {statusFilter}</div>
        ) : null}
        {!loading && (
          <table className="ops-table">
            <thead>
              <tr>
                <th>Corporate ID</th>
                <th>Corporate Name</th>
                <th>HR Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>{company.id}</td>
                  <td>{company.name}</td>
                  <td>{company.hrName || "--"}</td>
                  <td>{company.email || "--"}</td>
                  <td>{company.phone || "--"}</td>
                  <td>
                    <span
                      className={`ops-chip ${
                        company.status?.toLowerCase() === "active"
                          ? "success"
                          : company.status?.toLowerCase() === "inactive"
                            ? "danger"
                            : "warning"
                      }`}
                    >
                      {String(company.status ?? "pending").replace(/^\w/, (char) => char.toUpperCase())}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredCompanies.length && (
                <tr>
                  <td colSpan={6} className="ops-kpi-sub">
                    No corporates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="ops-pagination">
            <div className="ops-kpi-sub">
              Showing {meta.total ? `${startIndex}-${endIndex} of ${meta.total}` : `${companies.length} records`}
            </div>
            <div className="ops-pagination-controls">
              <button
                type="button"
                className="secondary"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="ops-kpi-sub">Page {page} of {totalPages}</span>
              <button
                type="button"
                className="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {showRegister && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Register New Corporate</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setShowRegister(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div className="ops-grid ops-grid--2">
                <label className="ops-span">
                  Corporate Name
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </label>
                <label>
                  HR Name
                  <input
                    value={formData.hrName}
                    onChange={(event) => setFormData((prev) => ({ ...prev, hrName: event.target.value }))}
                  />
                </label>
                <label>
                  HR Email
                  <input
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>
                <label>
                  Contact Number
                  <input
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </label>
                <label>
                  Billing Email
                  <input
                    value={formData.billingEmail}
                    onChange={(event) => setFormData((prev) => ({ ...prev, billingEmail: event.target.value }))}
                  />
                </label>
                <label>
                  Employee Count
                  <input
                    type="number"
                    min={0}
                    value={formData.employeeCount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, employeeCount: event.target.value }))}
                  />
                </label>
                <label>
                  Plan
                  <select
                    value={formData.plan}
                    onChange={(event) => setFormData((prev) => ({ ...prev, plan: event.target.value }))}
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={() => setShowRegister(false)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={handleRegister} disabled={saving}>
                {saving ? "Registering..." : "Register Corporate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
