import "../operations.css"

export function DoctorManagementPage() {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Doctors</h1>
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
    </main>
  )
}
