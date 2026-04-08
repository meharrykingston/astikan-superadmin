import { useMemo, useState } from "react"
import "./support-overrides.css"

export function SupportOverridesPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedId, setSelectedId] = useState("SUP-1024")

  const tickets = [
    { id: "SUP-1024", company: "HCLTech", type: "Billing", status: "Open", owner: "Riya", priority: "High", summary: "Invoice mismatch for Feb payouts", createdAt: "Today, 10:20 AM" },
    { id: "SUP-1021", company: "TCS", type: "Lab", status: "Pending", owner: "Arjun", priority: "Medium", summary: "Cancelled test refund pending", createdAt: "Yesterday, 6:10 PM" },
    { id: "SUP-1018", company: "Infosys", type: "Access", status: "Resolved", owner: "Neha", priority: "Low", summary: "Corporate admin reset required", createdAt: "02 Apr, 3:45 PM" },
    { id: "SUP-1014", company: "Wipro", type: "Claims", status: "Open", owner: "Ishaan", priority: "High", summary: "Claim stuck in verification", createdAt: "01 Apr, 5:12 PM" },
  ]

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return tickets.filter((ticket) => {
      const statusMatch = statusFilter === "all" || ticket.status.toLowerCase() === statusFilter
      const textMatch =
        !normalized ||
        `${ticket.id} ${ticket.company} ${ticket.summary} ${ticket.type}`.toLowerCase().includes(normalized)
      return statusMatch && textMatch
    })
  }, [query, statusFilter, tickets])

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0]

  return (
    <div className="support-overrides-page">
      <header className="support-head">
        <div>
          <h1>Support CRM</h1>
          <p>Track corporate feedback, escalations, and resolutions in one place.</p>
        </div>
        <button className="primary">Open Support Case</button>
      </header>

      <section className="support-grid">
        <aside className="support-list">
          <div className="support-filters">
            <input
              placeholder="Search ticket, company, issue..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="support-tickets">
            {filtered.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                className={`support-ticket ${ticket.id === selected?.id ? "active" : ""}`}
                onClick={() => setSelectedId(ticket.id)}
              >
                <div>
                  <strong>{ticket.company}</strong>
                  <span>{ticket.summary}</span>
                </div>
                <div className={`pill ${ticket.status.toLowerCase()}`}>{ticket.status}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="support-detail">
          {selected ? (
            <>
              <div className="support-detail-head">
                <div>
                  <h2>{selected.id}</h2>
                  <p>{selected.company} • {selected.type}</p>
                </div>
                <span className={`pill ${selected.status.toLowerCase()}`}>{selected.status}</span>
              </div>
              <div className="support-detail-grid">
                <div>
                  <span>Owner</span>
                  <strong>{selected.owner}</strong>
                </div>
                <div>
                  <span>Priority</span>
                  <strong>{selected.priority}</strong>
                </div>
                <div>
                  <span>Created</span>
                  <strong>{selected.createdAt}</strong>
                </div>
              </div>
              <div className="support-resolution">
                <h3>Resolution notes</h3>
                <textarea rows={5} placeholder="Add resolution details, actions, next steps..." />
                <button className="primary">Mark Resolved</button>
              </div>
            </>
          ) : (
            <div className="support-empty">Select a support case to view details.</div>
          )}
        </section>
      </section>
    </div>
  )
}
