import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import "../operations.css"
import { fetchDoctorsAdmin, updateDoctorAdmin, type DoctorAdminRecord } from "../../services/doctorsAdminApi"

export function DoctorManagementPage() {
  const [showActions, setShowActions] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorAdminRecord | null>(null)
  const [doctors, setDoctors] = useState<DoctorAdminRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const buildAvatar = (name: string) => {
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "DR"
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e7ecf7"/>
            <stop offset="100%" stop-color="#cfd7ea"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="32" fill="url(#g)"/>
        <text x="50%" y="54%" text-anchor="middle" font-family="Satoshi, Arial" font-size="22" fill="#374151" font-weight="700">${initials}</text>
      </svg>
    `.trim()
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    void fetchDoctorsAdmin()
      .then((rows) => {
        if (!active) return
        setDoctors(rows)
        setError("")
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load doctors")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const statusCounts = useMemo(() => {
    const total = doctors.length
    const active = doctors.filter((doc) => doc.status === "Active").length
    const pending = doctors.filter((doc) => doc.status === "Pending").length
    const kyc = doctors.filter((doc) => doc.status === "KYC").length
    const inactive = doctors.filter((doc) => doc.status === "Inactive").length
    return { total, active, pending, kyc, inactive }
  }, [doctors])

  return (
    <main className="ops-page">
      <header className="ops-head ops-head-row">
        <div>
          <h1>Doctors</h1>
        </div>
        <button
          type="button"
          className="ops-icon-btn"
          onClick={() => setShowActions((prev) => !prev)}
          aria-label="Add doctor actions"
        >
          <Plus size={18} />
        </button>
      </header>

      <section className="ops-grid ops-grid--5">
        <article className="ops-card">
          <h2>All Doctors</h2>
          <div className="ops-kpi">{statusCounts.total}</div>
          <div className="ops-kpi-sub">Total onboarded</div>
        </article>
        <article className="ops-card">
          <h2>Active Doctors</h2>
          <div className="ops-kpi">{statusCounts.active}</div>
          <div className="ops-kpi-sub">Available for consults</div>
        </article>
        <article className="ops-card">
          <h2>Pending Approvals</h2>
          <div className="ops-kpi">{statusCounts.pending}</div>
          <div className="ops-kpi-sub">Awaiting verification</div>
        </article>
        <article className="ops-card">
          <h2>Pending KYC</h2>
          <div className="ops-kpi">{statusCounts.kyc}</div>
          <div className="ops-kpi-sub">Documents required</div>
        </article>
        <article className="ops-card">
          <h2>Inactive</h2>
          <div className="ops-kpi">{statusCounts.inactive}</div>
          <div className="ops-kpi-sub">Temporarily disabled</div>
        </article>
      </section>

      <section className="ops-table-wrap">
        {loading && <div className="ops-kpi-sub">Loading doctors...</div>}
        {error && <div className="ops-kpi-sub">{error}</div>}
        <table className="ops-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Username</th>
              <th>Password</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>
                  <img
                    className="ops-table-avatar"
                    src={doctor.image ?? buildAvatar(doctor.name)}
                    alt={doctor.name}
                    onError={(event) => {
                      event.currentTarget.src = buildAvatar(doctor.name)
                    }}
                  />
                </td>
                <td>{doctor.name}</td>
                <td>{doctor.username}</td>
                <td>{doctor.password}</td>
                <td>{doctor.email}</td>
                <td>{doctor.phone}</td>
                <td>{doctor.specialty}</td>
                <td>
                  <span className={`ops-chip ${doctor.status === "Active" ? "success" : doctor.status === "Inactive" ? "danger" : "warning"}`}>
                    {doctor.status}
                  </span>
                </td>
                <td>
                  <button type="button" className="primary" onClick={() => setEditingDoctor(doctor)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showActions && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Add Doctors</h2>
              <button type="button" className="ops-modal-close" onClick={() => setShowActions(false)}>
                Close
              </button>
            </div>
            <div className="ops-grid ops-grid--2">
              <article className="ops-card">
                <h2>Add Doctor</h2>
                <p className="ops-kpi-sub">Create a new doctor profile manually.</p>
                <div className="ops-actions">
                  <button type="button" className="primary">Add Doctor</button>
                </div>
              </article>
              <article className="ops-card">
                <h2>Upload Doctors</h2>
                <p className="ops-kpi-sub">Bulk import doctors via Excel/CSV.</p>
                <label>
                  Select file
                  <input type="file" accept=".xlsx,.xls,.csv,text/csv" />
                </label>
                <div className="ops-actions">
                  <button type="button" className="primary">Upload</button>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}

      {editingDoctor && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Edit Doctor</h2>
              <button type="button" className="ops-modal-close" onClick={() => setEditingDoctor(null)}>
                Close
              </button>
            </div>
            <div className="ops-grid ops-grid--2">
              <label>
                Name
                <input
                  value={editingDoctor.name}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, name: event.target.value })}
                />
              </label>
              <label>
                Username
                <input
                  value={editingDoctor.username}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, username: event.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  value={editingDoctor.password}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, password: event.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  value={editingDoctor.email}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, email: event.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={editingDoctor.phone}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, phone: event.target.value })}
                />
              </label>
              <label>
                Specialty
                <input
                  value={editingDoctor.specialty}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, specialty: event.target.value })}
                />
              </label>
              <label>
                Status
                <select
                  value={editingDoctor.status}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, status: event.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="KYC">KYC</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label>
                Profile Image URL
                <input
                  value={editingDoctor.image}
                  onChange={(event) => setEditingDoctor({ ...editingDoctor, image: event.target.value })}
                />
              </label>
            </div>
            <div className="ops-actions">
              <button
                type="button"
                className="primary"
                onClick={() => {
                  void updateDoctorAdmin(editingDoctor.id, editingDoctor)
                    .then(() => {
                      setDoctors((prev) =>
                        prev.map((doc) => (doc.id === editingDoctor.id ? editingDoctor : doc))
                      )
                      setEditingDoctor(null)
                    })
                    .catch((err) => setError(err instanceof Error ? err.message : "Unable to save changes"))
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
