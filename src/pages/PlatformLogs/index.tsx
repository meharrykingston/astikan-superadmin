import { useEffect, useMemo, useState } from "react"
import { fetchPlatformLogs } from "../../services/platformApi"
import "../operations.css"

export function PlatformLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void fetchPlatformLogs({ limit: 200 })
      .then((rows) => {
        if (active) setLogs(rows)
      })
      .catch(() => {
        if (active) setLogs([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const metrics = useMemo(() => {
    const errors = logs.filter((item) => item.severity === 'error' || item.severity === 'critical').length
    const critical = logs.filter((item) => item.severity === 'critical').length
    return { errors, critical }
  }, [logs])

  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Platform Logs</h1>
        <p>Unified error and activity logs for frontend apps and backend services.</p>
      </header>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Errors Last 24h</h2>
          <div className="ops-kpi">{metrics.errors}</div>
          <div className="ops-kpi-sub">Mongo-backed platform error stream</div>
        </article>
        <article className="ops-card">
          <h2>Critical Incidents</h2>
          <div className="ops-kpi">{metrics.critical}</div>
          <div className="ops-kpi-sub">Live severity aggregation from backend logs</div>
        </article>
      </section>

      <section className="ops-actions">
        <button type="button">Mongo Source</button>
        <button type="button">Severity Indexed</button>
        <button type="button" className="primary">Live Stream</button>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Service</th>
              <th>Module</th>
              <th>Severity</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5}>No Mongo-backed platform logs found.</td>
              </tr>
            ) : (
              logs.map((item, index) => (
                <tr key={`${item._id ?? item.eventAt}-${index}`}>
                  <td>{item.eventAt ? new Date(item.eventAt).toLocaleString('en-IN') : '--'}</td>
                  <td>{item.service ?? '--'}</td>
                  <td>{item.module ?? '--'}</td>
                  <td>
                    <span className={`ops-chip ${item.severity === 'error' || item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : 'success'}`}>
                      {String(item.severity ?? 'info').toUpperCase()}
                    </span>
                  </td>
                  <td>{item.message ?? '--'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}
