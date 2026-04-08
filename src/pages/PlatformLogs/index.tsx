import { useEffect, useMemo, useRef, useState } from "react"
import { fetchPlatformLogs } from "../../services/platformApi"
import "../operations.css"

export function PlatformLogsPage() {
  const [backendLogs, setBackendLogs] = useState<any[]>([])
  const [frontendLogs, setFrontendLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sourceFilter, setSourceFilter] = useState<"all" | "frontend" | "backend">("all")
  const [severityFilter, setSeverityFilter] = useState<"all" | "error" | "warning" | "info" | "debug">("all")
  const initialCaptureRef = useRef(false)

  useEffect(() => {
    let active = true
    void fetchPlatformLogs({ limit: 200 })
      .then((rows) => {
        if (active) setBackendLogs(rows)
      })
      .catch(() => {
        if (active) setBackendLogs([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (initialCaptureRef.current) return
    initialCaptureRef.current = true
    const pushFrontendLog = (severity: "error" | "warning" | "info" | "debug", message: string, meta?: any) => {
      const entry = {
        source: "frontend",
        severity,
        message,
        meta,
        eventAt: new Date().toISOString(),
        service: "browser",
        module: meta?.module ?? "ui",
      }
      setFrontendLogs((prev) => [entry, ...prev].slice(0, 300))
    }

    const formatArgs = (args: any[]) =>
      args
        .map((arg) => {
          if (arg instanceof Error) return `${arg.name}: ${arg.message}`
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg)
            } catch {
              return "[object]"
            }
          }
          return String(arg)
        })
        .join(" ")

    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    }

    pushFrontendLog("info", "Frontend log stream connected.", { method: "init" })

    console.log = (...args: any[]) => {
      pushFrontendLog("info", formatArgs(args), { method: "log" })
      original.log(...args)
    }
    console.info = (...args: any[]) => {
      pushFrontendLog("info", formatArgs(args), { method: "info" })
      original.info(...args)
    }
    console.warn = (...args: any[]) => {
      pushFrontendLog("warning", formatArgs(args), { method: "warn" })
      original.warn(...args)
    }
    console.error = (...args: any[]) => {
      pushFrontendLog("error", formatArgs(args), { method: "error" })
      original.error(...args)
    }
    console.debug = (...args: any[]) => {
      pushFrontendLog("debug", formatArgs(args), { method: "debug" })
      original.debug(...args)
    }

    const onError = (event: ErrorEvent) => {
      pushFrontendLog("error", event.message || "Runtime error", {
        module: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "Unhandled rejection")
      pushFrontendLog("error", reason, { module: "unhandledrejection" })
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)

    return () => {
      console.log = original.log
      console.info = original.info
      console.warn = original.warn
      console.error = original.error
      console.debug = original.debug
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [])

  const mergedLogs = useMemo(() => {
    const backend = backendLogs.map((item) => ({
      ...item,
      source: "backend",
      eventAt: item.eventAt ?? item.timestamp ?? new Date().toISOString(),
      severity: item.severity ?? "info",
    }))
    const merged = [...frontendLogs, ...backend]
    return merged.sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
  }, [backendLogs, frontendLogs])

  const filteredLogs = useMemo(() => {
    return mergedLogs.filter((item) => {
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false
      if (severityFilter !== "all" && String(item.severity) !== severityFilter) return false
      return true
    })
  }, [mergedLogs, sourceFilter, severityFilter])

  const metrics = useMemo(() => {
    const allErrors = mergedLogs.filter((item) => item.severity === "error" || item.severity === "critical").length
    const critical = mergedLogs.filter((item) => item.severity === "critical").length
    const total = mergedLogs.length
    const frontendCount = mergedLogs.filter((item) => item.source === "frontend").length
    const backendCount = mergedLogs.filter((item) => item.source === "backend").length
    return { errors: allErrors, critical, total, frontendCount, backendCount }
  }, [mergedLogs])

  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Platform Logs</h1>
        <p>Unified error and activity logs for frontend apps and backend services.</p>
      </header>

      <section className="ops-grid ops-grid--4">
        <article className="ops-card">
          <h2>Errors Last 24h</h2>
          <div className="ops-kpi">{metrics.errors}</div>
          <div className="ops-kpi-sub">Frontend + backend errors</div>
        </article>
        <article className="ops-card">
          <h2>Critical Incidents</h2>
          <div className="ops-kpi">{metrics.critical}</div>
          <div className="ops-kpi-sub">Live severity aggregation from backend logs</div>
        </article>
        <article className="ops-card">
          <h2>Total Logs</h2>
          <div className="ops-kpi">{metrics.total}</div>
          <div className="ops-kpi-sub">All events across services</div>
        </article>
        <article className="ops-card">
          <h2>Frontend / Backend</h2>
          <div className="ops-kpi">{metrics.frontendCount} / {metrics.backendCount}</div>
          <div className="ops-kpi-sub">Live browser + server feed</div>
        </article>
      </section>

      <section className="ops-actions">
        <button type="button">Mongo Source</button>
        <button type="button">Severity Indexed</button>
        <button type="button" className="primary">Live Stream</button>
      </section>

      {loading ? (
        <div className="ops-loader-fullscreen">
          <div className="ops-spinner" />
          <span>Loading logs...</span>
        </div>
      ) : null}

      <section className="ops-table-wrap">
        <div className="ops-table-filters">
          <div className="ops-chip-row">
            {(["all", "frontend", "backend"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={sourceFilter === item ? "active" : ""}
                onClick={() => setSourceFilter(item)}
              >
                {item === "all" ? "All sources" : item}
              </button>
            ))}
          </div>
          <div className="ops-chip-row">
            {(["all", "error", "warning", "info", "debug"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={severityFilter === item ? "active" : ""}
                onClick={() => setSeverityFilter(item)}
              >
                {item === "all" ? "All severities" : item}
              </button>
            ))}
          </div>
        </div>
        <table className="ops-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Source</th>
              <th>Service</th>
              <th>Module</th>
              <th>Severity</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6}>No logs found.</td>
              </tr>
            ) : !loading ? (
              filteredLogs.map((item, index) => (
                <tr key={`${item._id ?? item.eventAt}-${index}`}>
                  <td>{item.eventAt ? new Date(item.eventAt).toLocaleString('en-IN') : '--'}</td>
                  <td>
                    <span className="ops-chip">{String(item.source ?? "backend")}</span>
                  </td>
                  <td>{item.service ?? '--'}</td>
                  <td>{item.module ?? '--'}</td>
                  <td>
                    <span className={`ops-chip ${item.severity === 'error' || item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : item.severity === 'debug' ? '' : 'success'}`}>
                      {String(item.severity ?? 'info').toUpperCase()}
                    </span>
                  </td>
                  <td>{item.message ?? '--'}</td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  )
}
