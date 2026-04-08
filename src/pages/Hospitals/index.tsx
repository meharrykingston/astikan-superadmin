import "./hospitals.css"

export function HospitalsPage() {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Hospitals</h1>
        <p>Manage hospital partners, onboarding status, and account access.</p>
      </header>

      <section className="ops-grid ops-grid--3">
        <article className="ops-card">
          <h2>All Hospitals</h2>
          <div className="ops-kpi">128</div>
          <div className="ops-kpi-sub">Registered partners</div>
        </article>
        <article className="ops-card">
          <h2>Active</h2>
          <div className="ops-kpi">94</div>
          <div className="ops-kpi-sub">Currently live</div>
        </article>
        <article className="ops-card">
          <h2>Pending</h2>
          <div className="ops-kpi">12</div>
          <div className="ops-kpi-sub">Awaiting review</div>
        </article>
      </section>

      <section className="ops-table-wrap">
        <div className="ops-table-filters">
          <div className="ops-search">
            <input placeholder="Search hospital" />
          </div>
          <div className="ops-filter-select">
            <select>
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>
        <table className="ops-table">
          <thead>
            <tr>
              <th>Hospital ID</th>
              <th>Hospital</th>
              <th>City</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>HSP-1029</td>
              <td>Astikan Care Center</td>
              <td>Delhi</td>
              <td>+91 98100 88771</td>
              <td><span className="ops-chip success">ACTIVE</span></td>
            </tr>
            <tr>
              <td>HSP-1181</td>
              <td>Metro Health Hub</td>
              <td>Mumbai</td>
              <td>+91 98220 33041</td>
              <td><span className="ops-chip warning">PENDING</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  )
}
