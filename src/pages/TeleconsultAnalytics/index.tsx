import "../operations.css"

const data = [
  { period: "Today", consults: 518, minutes: 12840, avg: "24.7 min", conversion: "62%" },
  { period: "Last 7 Days", consults: 3482, minutes: 83220, avg: "23.9 min", conversion: "60%" },
  { period: "Last 30 Days", consults: 14214, minutes: 328770, avg: "23.1 min", conversion: "58%" },
]

export function TeleconsultAnalyticsPage() {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Teleconsult Analytics</h1>
        <p>Sessions, utilization, conversion, and total teleconsultation minutes consumed.</p>
      </header>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Total Minutes Used</h2>
          <div className="ops-kpi">328,770</div>
          <div className="ops-kpi-sub">Last 30 days</div>
        </article>
        <article className="ops-card">
          <h2>Live Doctors in Teleconsult</h2>
          <div className="ops-kpi">214</div>
          <div className="ops-kpi-sub">At current 15-min window</div>
        </article>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Consultations</th>
              <th>Minutes Used</th>
              <th>Average Duration</th>
              <th>OPD to Tele Conversion</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.period}>
                <td>{item.period}</td>
                <td>{item.consults}</td>
                <td>{item.minutes}</td>
                <td>{item.avg}</td>
                <td>{item.conversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
