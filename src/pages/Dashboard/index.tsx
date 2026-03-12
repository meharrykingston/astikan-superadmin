import { useMemo, useState } from "react"
import {
  Activity,
  BriefcaseMedical,
  Building2,
  CreditCard,
  Gauge,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react"
import "./dashboard.css"

type RangeKey = "7d" | "30d" | "90d"
type CompanyKey = "all" | "hcl" | "tcs" | "infosys" | "vertex"

type TrendPoint = { day: string; labs: number; consults: number; opd: number }

const trendByRange: Record<RangeKey, TrendPoint[]> = {
  "7d": [
    { day: "D1", labs: 182, consults: 120, opd: 62 },
    { day: "D2", labs: 195, consults: 126, opd: 67 },
    { day: "D3", labs: 214, consults: 137, opd: 70 },
    { day: "D4", labs: 208, consults: 141, opd: 66 },
    { day: "D5", labs: 236, consults: 149, opd: 74 },
    { day: "D6", labs: 242, consults: 151, opd: 79 },
    { day: "D7", labs: 251, consults: 158, opd: 82 },
  ],
  "30d": Array.from({ length: 10 }, (_, i) => ({
    day: `W${i + 1}`,
    labs: 760 + i * 18,
    consults: 470 + i * 11,
    opd: 260 + i * 8,
  })),
  "90d": Array.from({ length: 12 }, (_, i) => ({
    day: `M${i + 1}`,
    labs: 2800 + i * 160,
    consults: 1760 + i * 102,
    opd: 980 + i * 78,
  })),
}

const companyMultiplier: Record<CompanyKey, number> = {
  all: 1,
  hcl: 0.34,
  tcs: 0.28,
  infosys: 0.22,
  vertex: 0.16,
}

const corporateSeed = [
  { id: "REQ-1001", company: "BlueOrbit Tech", employees: 420, plan: "Growth", requestedCredits: 250000 },
  { id: "REQ-1002", company: "Vertex Logistics", employees: 1120, plan: "Enterprise", requestedCredits: 900000 },
  { id: "REQ-1003", company: "Nova Finance", employees: 280, plan: "Starter", requestedCredits: 120000 },
]

const doctorSeed = [
  { id: "DOC-201", name: "Dr. R. Mehta", specialty: "General Physician", city: "Mumbai", mode: "Tele + OPD" },
  { id: "DOC-202", name: "Dr. A. Dutta", specialty: "Cardiology", city: "Bengaluru", mode: "Tele" },
  { id: "DOC-203", name: "Dr. P. Iyer", specialty: "Dermatology", city: "Chennai", mode: "OPD" },
]

const creditLedger = [
  { company: "HCLTech", purchased: 1800000, used: 1240000, remaining: 560000, burnRate: 68.9 },
  { company: "TCS", purchased: 2500000, used: 1710000, remaining: 790000, burnRate: 68.4 },
  { company: "Infosys", purchased: 1650000, used: 920000, remaining: 730000, burnRate: 55.8 },
  { company: "Vertex Logistics", purchased: 640000, used: 220000, remaining: 420000, burnRate: 34.4 },
]

function sparklinePath(values: number[]) {
  if (values.length === 0) return ""
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(max - min, 1)
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")
}

function formatINR(value: number) {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`
}

export function DashboardPage() {
  const [range, setRange] = useState<RangeKey>("30d")
  const [company, setCompany] = useState<CompanyKey>("all")
  const [focus, setFocus] = useState<"throughput" | "risk" | "finance">("throughput")
  const [corporateQueue, setCorporateQueue] = useState(corporateSeed)
  const [doctorQueue, setDoctorQueue] = useState(doctorSeed)

  const multiplier = companyMultiplier[company]
  const trend = trendByRange[range]

  const totals = useMemo(() => {
    const labs = Math.round(trend.reduce((sum, item) => sum + item.labs, 0) * multiplier)
    const consults = Math.round(trend.reduce((sum, item) => sum + item.consults, 0) * multiplier)
    const opd = Math.round(trend.reduce((sum, item) => sum + item.opd, 0) * multiplier)
    const totalUsers = Math.round((28740 + (range === "90d" ? 2200 : range === "30d" ? 900 : 240)) * multiplier)
    const revenue = Math.round((870000 + labs * 42 + consults * 36) * multiplier)
    const creditsSold = Math.round((5280000 + labs * 58) * multiplier)
    return { labs, consults, opd, totalUsers, revenue, creditsSold }
  }, [multiplier, range, trend])

  const channelMix = useMemo(() => {
    const total = Math.max(totals.labs + totals.consults + totals.opd, 1)
    return [
      { label: "Lab Tests", value: totals.labs, pct: (totals.labs / total) * 100 },
      { label: "Teleconsult", value: totals.consults, pct: (totals.consults / total) * 100 },
      { label: "OPD", value: totals.opd, pct: (totals.opd / total) * 100 },
    ]
  }, [totals.consults, totals.labs, totals.opd])

  const conversionFunnel = [
    { label: "Registrations", value: Math.round(1320 * multiplier) },
    { label: "Approved Companies", value: Math.round(980 * multiplier) },
    { label: "Credits Purchased", value: Math.round(744 * multiplier) },
    { label: "Active Employees", value: Math.round(652 * multiplier) },
  ]

  const sparkLabs = sparklinePath(trend.map((x) => Math.round(x.labs * multiplier)))
  const sparkConsults = sparklinePath(trend.map((x) => Math.round(x.consults * multiplier)))
  const sparkOpd = sparklinePath(trend.map((x) => Math.round(x.opd * multiplier)))
  const focusMessage =
    focus === "throughput"
      ? "Throughput focus enabled: routing more queues to high-performing providers."
      : focus === "risk"
        ? "Risk focus enabled: stricter alerts for SLA breach and provider failure retries."
        : "Finance focus enabled: highlighting burn variance and credit lock exposure."

  return (
    <div className="dashboard-page">
      <section className="dash-head">
        <div>
          <h1>Astikan Super Admin Command Center</h1>
          <p>
            End-to-end control for self-registered corporates, credit economy, doctors, and employee service utilization.
          </p>
          <div className="dash-head-tags">
            <span><ShieldCheck size={14} /> Audited</span>
            <span><Sparkles size={14} /> AI-assisted</span>
            <span><Activity size={14} /> Realtime</span>
          </div>
        </div>
        <div className="dash-filters">
          <div className="range-switch">
            {(["7d", "30d", "90d"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={range === item ? "active" : ""}
                onClick={() => setRange(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <select value={company} onChange={(e) => setCompany(e.target.value as CompanyKey)}>
            <option value="all">All Companies</option>
            <option value="hcl">HCLTech</option>
            <option value="tcs">TCS</option>
            <option value="infosys">Infosys</option>
            <option value="vertex">Vertex Logistics</option>
          </select>
        </div>
        <div className="dash-visual-card">
          <div className="dash-visual-badge"><Gauge size={14} /> Focus Controls</div>
          <div className="dash-focus-row">
            <button type="button" className={focus === "throughput" ? "active" : ""} onClick={() => setFocus("throughput")}>Throughput</button>
            <button type="button" className={focus === "risk" ? "active" : ""} onClick={() => setFocus("risk")}>Risk</button>
            <button type="button" className={focus === "finance" ? "active" : ""} onClick={() => setFocus("finance")}>Finance</button>
          </div>
          <p>{focusMessage}</p>
        </div>
      </section>

      <section className="dash-kpi-grid">
        <article className="dash-kpi-card">
          <div className="kpi-title"><UserRoundCheck size={14} /><p>Active Employees</p></div>
          <strong>{new Intl.NumberFormat("en-IN").format(totals.totalUsers)}</strong>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={sparkLabs} />
          </svg>
        </article>
        <article className="dash-kpi-card">
          <div className="kpi-title"><CreditCard size={14} /><p>Credits Sold</p></div>
          <strong>{formatINR(totals.creditsSold)}</strong>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={sparkConsults} />
          </svg>
        </article>
        <article className="dash-kpi-card">
          <div className="kpi-title"><BriefcaseMedical size={14} /><p>Platform Revenue</p></div>
          <strong>{formatINR(totals.revenue)}</strong>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={sparkOpd} />
          </svg>
        </article>
        <article className="dash-kpi-card">
          <div className="kpi-title"><Building2 size={14} /><p>Approval Backlog</p></div>
          <strong>{corporateQueue.length + doctorQueue.length}</strong>
          <small>{corporateQueue.length} corporate and {doctorQueue.length} doctor</small>
        </article>
      </section>

      <section className="dash-kpi-grid dash-kpi-grid-mini">
        <article className="dash-kpi-card mini">
          <p>Active Employees</p>
          <strong>{new Intl.NumberFormat("en-IN").format(Math.round(totals.totalUsers * 0.31))}</strong>
          <small>High-engagement employees</small>
        </article>
        <article className="dash-kpi-card mini">
          <p>Credits Locked</p>
          <strong>{formatINR(Math.round(totals.creditsSold * 0.42))}</strong>
          <small>Projected quarterly lock reserve</small>
        </article>
        <article className="dash-kpi-card mini">
          <p>Resolution SLA</p>
          <strong>96.8%</strong>
          <small>Tickets closed within target window</small>
        </article>
        <article className="dash-kpi-card mini">
          <p>Ops Health Score</p>
          <strong>{focus === "risk" ? "88" : focus === "finance" ? "91" : "93"}/100</strong>
          <small>Dynamic score based on current focus</small>
        </article>
      </section>

      <section className="dash-grid-three">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Service Mix</h2>
            <span>Usage Distribution</span>
          </div>
          <div className="mix-list">
            {channelMix.map((item) => (
              <div key={item.label} className="mix-row">
                <div className="mix-top">
                  <strong>{item.label}</strong>
                  <span>{new Intl.NumberFormat("en-IN").format(item.value)}</span>
                </div>
                <div className="mix-bar">
                  <i style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Corporate Conversion Funnel</h2>
            <span>Self-Registration to Activation</span>
          </div>
          <div className="funnel-list">
            {conversionFunnel.map((item, index) => {
              const first = conversionFunnel[0].value || 1
              const pct = (item.value / first) * 100
              return (
                <div key={item.label} className="funnel-row">
                  <p>{index + 1}. {item.label}</p>
                  <div className="funnel-value">{new Intl.NumberFormat("en-IN").format(item.value)}</div>
                  <div className="funnel-bar"><i style={{ width: `${pct}%` }} /></div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Operational Risk Radar</h2>
            <span>Priority Queue</span>
          </div>
          <div className="risk-list">
            <div className="risk-row high"><b>High</b><p>47 lab orders pending pickup SLA</p></div>
            <div className="risk-row medium"><b>Medium</b><p>12 teleconsult slots near capacity</p></div>
            <div className="risk-row low"><b>Low</b><p>4 provider webhook retries in 24h</p></div>
          </div>
        </article>
      </section>

      <section className="dash-grid-two">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Corporate Self-Registration Queue</h2>
            <span>{corporateQueue.length} pending approvals</span>
          </div>
          <div className="dash-list">
            {corporateQueue.map((item) => (
              <div key={item.id} className="dash-row">
                <div>
                  <strong>{item.company}</strong>
                  <p>{item.id} | {item.employees} employees | {item.plan}</p>
                  <small>Requested credits: {formatINR(item.requestedCredits)}</small>
                </div>
                <div className="dash-row-actions">
                  <button type="button" className="btn-soft" onClick={() => setCorporateQueue((prev) => prev.filter((x) => x.id !== item.id))}>
                    Reject
                  </button>
                  <button type="button" className="btn-primary" onClick={() => setCorporateQueue((prev) => prev.filter((x) => x.id !== item.id))}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {corporateQueue.length === 0 && <p className="dash-empty">No pending corporate approvals.</p>}
          </div>
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Doctor Onboarding Queue</h2>
            <span>{doctorQueue.length} pending approvals</span>
          </div>
          <div className="dash-list">
            {doctorQueue.map((item) => (
              <div key={item.id} className="dash-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.specialty} | {item.city}</p>
                  <small>Mode: {item.mode}</small>
                </div>
                <div className="dash-row-actions">
                  <button type="button" className="btn-primary" onClick={() => setDoctorQueue((prev) => prev.filter((x) => x.id !== item.id))}>
                    Approve Doctor
                  </button>
                </div>
              </div>
            ))}
            {doctorQueue.length === 0 && <p className="dash-empty">No pending doctor approvals.</p>}
          </div>
        </article>
      </section>

      <section className="dash-panel">
        <div className="dash-panel-head">
          <h2>Credit Burn Analytics by Company</h2>
          <span>Purchased vs Used vs Remaining</span>
        </div>
        <div className="credit-table">
          <div className="credit-head">
            <span>Company</span>
            <span>Purchased</span>
            <span>Used</span>
            <span>Remaining</span>
            <span>Burn Rate</span>
          </div>
          {creditLedger.map((row) => (
            <div key={row.company} className="credit-row">
              <span>{row.company}</span>
              <span>{formatINR(row.purchased)}</span>
              <span>{formatINR(row.used)}</span>
              <span>{formatINR(row.remaining)}</span>
              <span>
                <div className="burn-cell">
                  <i style={{ width: `${row.burnRate}%` }} />
                  <b>{row.burnRate.toFixed(1)}%</b>
                </div>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
