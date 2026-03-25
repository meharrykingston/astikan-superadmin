import { useState } from "react"
import "../operations.css"

export function DoctorManagementPage() {
  const [showActions, setShowActions] = useState(false)

  return (
    <main className="ops-page">
      <header className="ops-head ops-head-row">
        <div>
          <h1>Doctors</h1>
        </div>
        <button
          type="button"
          className="ops-primary-btn"
          onClick={() => setShowActions((prev) => !prev)}
        >
          {showActions ? "Hide" : "Add"}
        </button>
      </header>

      <section className="ops-grid ops-grid--5">
        <article className="ops-card">
          <h2>All Doctors</h2>
          <div className="ops-kpi">695</div>
          <div className="ops-kpi-sub">Total onboarded</div>
        </article>
        <article className="ops-card">
          <h2>Active Doctors</h2>
          <div className="ops-kpi">652</div>
          <div className="ops-kpi-sub">Available for consults</div>
        </article>
        <article className="ops-card">
          <h2>Pending Approvals</h2>
          <div className="ops-kpi">18</div>
          <div className="ops-kpi-sub">Awaiting verification</div>
        </article>
        <article className="ops-card">
          <h2>Pending KYC</h2>
          <div className="ops-kpi">21</div>
          <div className="ops-kpi-sub">Documents required</div>
        </article>
        <article className="ops-card">
          <h2>Inactive</h2>
          <div className="ops-kpi">4</div>
          <div className="ops-kpi-sub">Temporarily disabled</div>
        </article>
      </section>

      {showActions && (
        <section className="ops-grid ops-grid--2">
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
        </section>
      )}
    </main>
  )
}
