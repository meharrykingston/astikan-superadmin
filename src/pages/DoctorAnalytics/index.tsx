import "../operations.css"

const doctorStats = [
  { cohort: "All Doctors", count: 486, active: "81%", approvalLag: "2.1 days", avgRating: "4.6/5" },
  { cohort: "New Doctors (30d)", count: 64, active: "74%", approvalLag: "3.4 days", avgRating: "4.4/5" },
  { cohort: "Top Specialists", count: 112, active: "92%", approvalLag: "1.2 days", avgRating: "4.8/5" },
]

export function DoctorAnalyticsPage() {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Doctor Analytics</h1>
        <p>Supply, activation, approval timelines, and doctor quality indicators.</p>
      </header>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Doctors Available</h2>
          <div className="ops-kpi">486</div>
          <div className="ops-kpi-sub">Across 18 specialties</div>
        </article>
        <article className="ops-card">
          <h2>Approval SLA Breach</h2>
          <div className="ops-kpi">9.4%</div>
          <div className="ops-kpi-sub">Queue above 48h</div>
        </article>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Cohort</th>
              <th>Doctors</th>
              <th>Active</th>
              <th>Approval Lag</th>
              <th>Average Rating</th>
            </tr>
          </thead>
          <tbody>
            {doctorStats.map((item) => (
              <tr key={item.cohort}>
                <td>{item.cohort}</td>
                <td>{item.count}</td>
                <td>{item.active}</td>
                <td>{item.approvalLag}</td>
                <td>{item.avgRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
