import { useMemo, useState } from "react"
import "../operations.css"

type RangeKey = "weekly" | "monthly" | "yearly"
type HoveredPoint =
  | { chart: "volume"; label: string; tele: number; opd: number }
  | { chart: "credits"; label: string; credits: number }

const rangeConfig: Record<
  RangeKey,
  {
    label: string
    teleconsult: number
    opd: number
    avgTeleMinutes: number
    teleCredits: number
    opdCredits: number
    telePrice: number
    opdPrice: number
    upcoming: number
    ongoingOpd: number
    rescheduled: number
    done: number
  }
> = {
  weekly: {
    label: "This Week",
    teleconsult: 186,
    opd: 124,
    avgTeleMinutes: 21,
    teleCredits: 148800,
    opdCredits: 86800,
    telePrice: 14880,
    opdPrice: 8680,
    upcoming: 46,
    ongoingOpd: 12,
    rescheduled: 9,
    done: 243,
  },
  monthly: {
    label: "This Month",
    teleconsult: 842,
    opd: 566,
    avgTeleMinutes: 23,
    teleCredits: 672400,
    opdCredits: 396200,
    telePrice: 67240,
    opdPrice: 39620,
    upcoming: 132,
    ongoingOpd: 38,
    rescheduled: 44,
    done: 1194,
  },
  yearly: {
    label: "This Year",
    teleconsult: 10462,
    opd: 6931,
    avgTeleMinutes: 24,
    teleCredits: 8369600,
    opdCredits: 4851700,
    telePrice: 836960,
    opdPrice: 485170,
    upcoming: 982,
    ongoingOpd: 104,
    rescheduled: 366,
    done: 16044,
  },
}

const doctorLeaderboard = [
  { doctor: "Dr. R. Mehta", specialty: "General Physician", opdCount: 184, teleCount: 122, reviews: 4.9, employeePatients: 46, doctorAddedPatients: 28 },
  { doctor: "Dr. P. Iyer", specialty: "Dermatology", opdCount: 162, teleCount: 64, reviews: 4.8, employeePatients: 31, doctorAddedPatients: 42 },
  { doctor: "Dr. A. Shah", specialty: "Internal Medicine", opdCount: 148, teleCount: 114, reviews: 4.7, employeePatients: 52, doctorAddedPatients: 15 },
  { doctor: "Dr. S. Rao", specialty: "Orthopedics", opdCount: 136, teleCount: 28, reviews: 4.8, employeePatients: 24, doctorAddedPatients: 39 },
]

const recentTeleconsults = [
  {
    id: "TEL-9201",
    status: "Done",
    doctor: "Dr. R. Mehta",
    employee: "Rajesh Sharma",
    company: "Tech Corp India",
    reviewByDoctor: "BP under better control. Continue 5mg and stress reduction plan.",
    reviewByEmployee: "Doctor was clear and practical. Quick follow-up advice helped.",
    minutes: 22,
    credits: 1800,
    price: 180,
  },
  {
    id: "TEL-9202",
    status: "Upcoming",
    doctor: "Dr. A. Shah",
    employee: "Priya Patel",
    company: "Northstar Labs",
    reviewByDoctor: "Scheduled migraine follow-up with trigger review.",
    reviewByEmployee: "Awaiting consult slot.",
    minutes: 18,
    credits: 1500,
    price: 150,
  },
  {
    id: "TEL-9203",
    status: "Rescheduled",
    doctor: "Dr. P. Iyer",
    employee: "Sneha Reddy",
    company: "Zenware Systems",
    reviewByDoctor: "Shifted due to lab report pending.",
    reviewByEmployee: "Requested new slot after report upload.",
    minutes: 20,
    credits: 1600,
    price: 160,
  },
]

const opdFlow = [
  {
    id: "OPD-6101",
    status: "Undergoing",
    doctor: "Dr. S. Rao",
    employee: "Amit Kumar",
    company: "Tech Corp India",
    reviewByDoctor: "In-clinic musculoskeletal evaluation ongoing.",
    reviewByEmployee: "Waiting for imaging summary from doctor.",
    credits: 1300,
    price: 130,
  },
  {
    id: "OPD-6102",
    status: "Done",
    doctor: "Dr. R. Mehta",
    employee: "Nisha Tiwari",
    company: "Zenware Systems",
    reviewByDoctor: "Preventive workup advised. No urgent concern.",
    reviewByEmployee: "Good OPD experience. Very little wait time.",
    credits: 1400,
    price: 140,
  },
  {
    id: "OPD-6103",
    status: "Pending",
    doctor: "Dr. P. Iyer",
    employee: "Ritu Verma",
    company: "Northstar Labs",
    reviewByDoctor: "Skin flare evaluation booked for tomorrow.",
    reviewByEmployee: "Pending clinic arrival.",
    credits: 1250,
    price: 125,
  },
]

type ActiveConsultation = {
  id: string
  status: string
  doctor: string
  employee: string
  company: string
  reviewByDoctor: string
  reviewByEmployee: string
  credits: number
  price: number
  minutes?: number
}

const doctorAddedPatients = [
  { patient: "Karan Sethi", doctor: "Dr. P. Iyer", bookedOpds: 6, latestBooking: "Dermatitis flare", source: "Doctor App" },
  { patient: "Mira Kulkarni", doctor: "Dr. S. Rao", bookedOpds: 4, latestBooking: "Knee pain follow-up", source: "Doctor App" },
  { patient: "Farhan Ali", doctor: "Dr. R. Mehta", bookedOpds: 7, latestBooking: "BP and sugar review", source: "Doctor App" },
]

const trendSeries: Record<RangeKey, Array<{ label: string; tele: number; opd: number; credits: number }>> = {
  weekly: [
    { label: "Mon", tele: 24, opd: 18, credits: 31200 },
    { label: "Tue", tele: 28, opd: 16, credits: 33800 },
    { label: "Wed", tele: 22, opd: 19, credits: 29600 },
    { label: "Thu", tele: 31, opd: 17, credits: 35100 },
    { label: "Fri", tele: 29, opd: 21, credits: 38400 },
    { label: "Sat", tele: 27, opd: 15, credits: 30100 },
    { label: "Sun", tele: 25, opd: 18, credits: 27400 },
  ],
  monthly: [
    { label: "W1", tele: 186, opd: 124, credits: 235600 },
    { label: "W2", tele: 204, opd: 136, credits: 256200 },
    { label: "W3", tele: 219, opd: 148, credits: 279400 },
    { label: "W4", tele: 233, opd: 158, credits: 297400 },
  ],
  yearly: [
    { label: "Q1", tele: 2480, opd: 1610, credits: 3156000 },
    { label: "Q2", tele: 2575, opd: 1694, credits: 3261400 },
    { label: "Q3", tele: 2643, opd: 1762, credits: 3335200 },
    { label: "Q4", tele: 2764, opd: 1865, credits: 3468700 },
  ],
}

function formatINR(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`
}

function formatCredits(value: number) {
  return `${new Intl.NumberFormat("en-IN").format(value)} credits`
}

function statusClass(status: string) {
  if (status === "Done") return "success"
  if (status === "Undergoing" || status === "Upcoming") return "warning"
  if (status === "Pending" || status === "Rescheduled") return "danger"
  return ""
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function getDateRange(range: RangeKey) {
  const end = new Date("2026-03-06T00:00:00")
  const start = new Date(end)
  if (range === "weekly") start.setDate(end.getDate() - 6)
  if (range === "monthly") start.setDate(end.getDate() - 29)
  if (range === "yearly") start.setFullYear(end.getFullYear() - 1)
  if (range === "yearly") start.setDate(start.getDate() + 1)
  return `${formatDate(start)} to ${formatDate(end)}`
}

function linePath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1)
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - (value / max) * height
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function linePoints(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1)
  return values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * width,
    y: height - (value / max) * height,
    value,
  }))
}

function compareRange(range: RangeKey): RangeKey | null {
  if (range === "weekly") return null
  if (range === "monthly") return "weekly"
  return "monthly"
}

function deltaText(current: number, previous: number) {
  if (!previous) return "New"
  const delta = ((current - previous) / previous) * 100
  const prefix = delta >= 0 ? "+" : ""
  return `${prefix}${delta.toFixed(1)}%`
}

export function OPDAnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("monthly")
  const [searchId, setSearchId] = useState("")
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null)
  const summary = rangeConfig[range]
  const dateRangeLabel = getDateRange(range)
  const activeTimeline = useMemo<ActiveConsultation[]>(() => [...recentTeleconsults, ...opdFlow], [])

  const totalCredits = summary.teleCredits + summary.opdCredits
  const totalPrice = summary.telePrice + summary.opdPrice
  const trend = trendSeries[range]
  const previousRange = compareRange(range)
  const previousSummary = previousRange ? rangeConfig[previousRange] : null

  const mix = useMemo(() => {
    const total = Math.max(summary.teleconsult + summary.opd, 1)
    return {
      telePct: Math.round((summary.teleconsult / total) * 100),
      opdPct: Math.round((summary.opd / total) * 100),
    }
  }, [summary])

  const searchedActiveTimeline = useMemo(() => {
    const q = searchId.trim().toLowerCase()
    if (!q) return activeTimeline
    return activeTimeline.filter((item) => item.id.toLowerCase().includes(q))
  }, [activeTimeline, searchId])

  const telePath = linePath(trend.map((item) => item.tele), 300, 70)
  const opdPath = linePath(trend.map((item) => item.opd), 300, 70)
  const creditPath = linePath(trend.map((item) => item.credits), 300, 70)
  const telePoints = linePoints(trend.map((item) => item.tele), 300, 70)
  const opdPoints = linePoints(trend.map((item) => item.opd), 300, 70)
  const creditPoints = linePoints(trend.map((item) => item.credits), 300, 70)

  return (
    <main className="ops-page">
      <header className="ops-head">
        <div>
          <h1>OPD + Teleconsult Operations</h1>
          <p>Weekly, monthly, and yearly analytics across teleconsultation, OPD, credits, pricing, reviews, and doctor productivity.</p>
          <div className="ops-date-range">{dateRangeLabel}</div>
        </div>
        <div className="ops-range-switch">
          {(["weekly", "monthly", "yearly"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={range === item ? "active" : ""}
              onClick={() => setRange(item)}
            >
              {item === "weekly" ? "Weekly" : item === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </header>

      <section className="ops-grid ops-grid--4">
        <article className="ops-card">
          <h2>Total Teleconsultations</h2>
          <div className="ops-kpi">{summary.teleconsult}</div>
          <div className="ops-kpi-sub">{summary.label} total teleconsult sessions</div>
        </article>
        <article className="ops-card">
          <h2>Total OPD Visits</h2>
          <div className="ops-kpi">{summary.opd}</div>
          <div className="ops-kpi-sub">{summary.label} total clinic visits</div>
        </article>
        <article className="ops-card">
          <h2>Average Teleconsult Time</h2>
          <div className="ops-kpi">{summary.avgTeleMinutes} min</div>
          <div className="ops-kpi-sub">Average duration per teleconsult</div>
        </article>
        <article className="ops-card">
          <h2>Total Credit Usage</h2>
          <div className="ops-kpi">{formatCredits(totalCredits)}</div>
          <div className="ops-kpi-sub">{formatINR(totalPrice)} equivalent billed value</div>
        </article>
      </section>

      <section className="ops-grid ops-grid--3">
        <article className="ops-card">
          <h2>Teleconsult Delta</h2>
          <div className="ops-delta-value">{previousSummary ? deltaText(summary.teleconsult, previousSummary.teleconsult) : "Baseline"}</div>
          <div className="ops-kpi-sub">{previousSummary ? `vs ${previousSummary.label}` : "First comparison window"}</div>
        </article>
        <article className="ops-card">
          <h2>OPD Delta</h2>
          <div className="ops-delta-value">{previousSummary ? deltaText(summary.opd, previousSummary.opd) : "Baseline"}</div>
          <div className="ops-kpi-sub">{previousSummary ? `vs ${previousSummary.label}` : "First comparison window"}</div>
        </article>
        <article className="ops-card">
          <h2>Credits Delta</h2>
          <div className="ops-delta-value">{previousSummary ? deltaText(totalCredits, previousSummary.teleCredits + previousSummary.opdCredits) : "Baseline"}</div>
          <div className="ops-kpi-sub">{previousSummary ? `vs ${previousSummary.label}` : "First comparison window"}</div>
        </article>
      </section>

      <section className="ops-grid ops-grid--3">
        <article className="ops-card">
          <div className="ops-section-head">
            <h2>Tele vs OPD Mix</h2>
            <span className="ops-chip">{dateRangeLabel}</span>
          </div>
          <div className="ops-pie-shell">
            <div
              className="ops-pie"
              style={{
                background: `conic-gradient(#2d6cdf 0 ${mix.telePct}%, #24b57a ${mix.telePct}% 100%)`,
              }}
            >
              <div className="ops-pie-hole">
                <strong>{mix.telePct + mix.opdPct}%</strong>
                <small>usage tracked</small>
              </div>
            </div>
            <div className="ops-pie-legend">
              <div><i className="tele" /> Teleconsult {mix.telePct}%</div>
              <div><i className="opd" /> OPD {mix.opdPct}%</div>
            </div>
          </div>
        </article>

        <article className="ops-card">
          <div className="ops-section-head">
            <h2>Consult Volume Trend</h2>
            <span className="ops-chip success">Real values</span>
          </div>
          <svg viewBox="0 0 300 84" className="ops-chart">
            <path d={telePath} className="tele-line" />
            <path d={opdPath} className="opd-line" />
            {trend.map((item, index) => (
              <g key={item.label}>
                <circle
                  className="ops-point tele-point"
                  cx={telePoints[index]?.x}
                  cy={telePoints[index]?.y}
                  r="5"
                  onMouseEnter={() => setHoveredPoint({ chart: "volume", label: item.label, tele: item.tele, opd: item.opd })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  className="ops-point opd-point"
                  cx={opdPoints[index]?.x}
                  cy={opdPoints[index]?.y}
                  r="5"
                  onMouseEnter={() => setHoveredPoint({ chart: "volume", label: item.label, tele: item.tele, opd: item.opd })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>
          <div className="ops-axis-labels">
            {trend.map((item) => <span key={item.label}>{item.label}</span>)}
          </div>
          <div className="ops-chart-tooltip">
            {hoveredPoint?.chart === "volume"
              ? `${hoveredPoint.label}: Tele ${hoveredPoint.tele}, OPD ${hoveredPoint.opd}`
              : "Hover a chart point to inspect exact consult values"}
          </div>
        </article>

        <article className="ops-card">
          <div className="ops-section-head">
            <h2>Credits Consumption Trend</h2>
            <span className="ops-chip warning">{formatCredits(totalCredits)}</span>
          </div>
          <svg viewBox="0 0 300 84" className="ops-chart">
            <path d={creditPath} className="credit-line" />
            {trend.map((item, index) => (
              <circle
                key={item.label}
                className="ops-point credit-point"
                cx={creditPoints[index]?.x}
                cy={creditPoints[index]?.y}
                r="5"
                onMouseEnter={() => setHoveredPoint({ chart: "credits", label: item.label, credits: item.credits })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>
          <div className="ops-axis-labels">
            {trend.map((item) => <span key={item.label}>{item.label}</span>)}
          </div>
          <div className="ops-chart-tooltip">
            {hoveredPoint?.chart === "credits"
              ? `${hoveredPoint.label}: ${formatCredits(hoveredPoint.credits)}`
              : "Hover a chart point to inspect exact credit usage"}
          </div>
        </article>
      </section>

      <section className="ops-grid ops-grid--3">
        <article className="ops-card">
          <h2>Consultation Status Mix</h2>
          <div className="ops-status-stack">
            <div><span>Upcoming Consultations</span><strong>{summary.upcoming}</strong></div>
            <div><span>OPD Undergoing</span><strong>{summary.ongoingOpd}</strong></div>
            <div><span>Rescheduled</span><strong>{summary.rescheduled}</strong></div>
            <div><span>Done</span><strong>{summary.done}</strong></div>
          </div>
        </article>
        <article className="ops-card">
          <h2>Usage Split</h2>
          <div className="ops-compare">
            <div>
              <span>Teleconsult usage</span>
              <strong>{mix.telePct}%</strong>
              <small>{summary.teleconsult} sessions</small>
            </div>
            <div className="ops-bar"><i style={{ width: `${mix.telePct}%` }} /></div>
            <div>
              <span>OPD usage</span>
              <strong>{mix.opdPct}%</strong>
              <small>{summary.opd} visits</small>
            </div>
            <div className="ops-bar alt"><i style={{ width: `${mix.opdPct}%` }} /></div>
          </div>
        </article>
        <article className="ops-card">
          <h2>Credit vs Price Summary</h2>
          <div className="ops-money-grid">
            <article>
              <span>Tele Credits</span>
              <strong>{formatCredits(summary.teleCredits)}</strong>
              <small>{formatINR(summary.telePrice)}</small>
            </article>
            <article>
              <span>OPD Credits</span>
              <strong>{formatCredits(summary.opdCredits)}</strong>
              <small>{formatINR(summary.opdPrice)}</small>
            </article>
          </div>
        </article>
      </section>

      <section className="ops-grid ops-grid--2">
        <article className="ops-card">
          <div className="ops-section-head">
            <h2>Detailed Summary of Past / Upcoming Teleconsults</h2>
            <span className="ops-chip">{summary.label}</span>
          </div>
          <label className="ops-search">
            <span>Search active consultation by ID</span>
            <input
              value={searchId}
              onChange={(event) => setSearchId(event.target.value)}
              placeholder="Search e.g. TEL-9202 or OPD-6101"
            />
          </label>
          <div className="ops-timeline">
            {searchedActiveTimeline.filter((item) => item.id.startsWith("TEL")).map((item) => (
              <article key={item.id} className="ops-timeline-item">
                <div className={`ops-chip ${statusClass(item.status)}`}>{item.status}</div>
                <div className="ops-timeline-copy">
                  <strong>{item.id} • {item.doctor} → {item.employee}</strong>
                  <p>{item.company} • {item.minutes} mins • {formatCredits(item.credits)} • {formatINR(item.price)}</p>
                  <small>Doctor review: {item.reviewByDoctor}</small>
                  <small>Employee review: {item.reviewByEmployee}</small>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="ops-card">
          <div className="ops-section-head">
            <h2>OPD Visit Flow</h2>
            <span className="ops-chip warning">{summary.ongoingOpd} ongoing</span>
          </div>
          <div className="ops-timeline">
            {searchedActiveTimeline.filter((item) => item.id.startsWith("OPD")).map((item) => (
              <article key={item.id} className="ops-timeline-item">
                <div className={`ops-chip ${statusClass(item.status)}`}>{item.status}</div>
                <div className="ops-timeline-copy">
                  <strong>{item.id} • {item.doctor} → {item.employee}</strong>
                  <p>{item.company} • {formatCredits(item.credits)} • {formatINR(item.price)}</p>
                  <small>Doctor review: {item.reviewByDoctor}</small>
                  <small>Employee review: {item.reviewByEmployee}</small>
                </div>
              </article>
            ))}
            {!searchedActiveTimeline.filter((item) => item.id.startsWith("OPD")).length ? <p>No OPD consultation found for this ID.</p> : null}
          </div>
        </article>
      </section>

      <section className="ops-grid ops-grid--2">
        <article className="ops-card">
          <div className="ops-section-head">
            <h2>Top OPD Doctors</h2>
            <span className="ops-chip success">Leaderboard</span>
          </div>
          <div className="ops-leaderboard">
            {doctorLeaderboard.map((item, index) => (
              <article key={item.doctor} className="ops-leader-row">
                <div className="ops-rank">{index + 1}</div>
                <div className="ops-leader-copy">
                  <strong>{item.doctor}</strong>
                  <p>{item.specialty}</p>
                  <small>{item.opdCount} OPDs • {item.teleCount} teleconsults • {item.reviews}/5 reviews</small>
                </div>
                <div className="ops-leader-meta">
                  <span>{item.employeePatients} employee patients</span>
                  <span>{item.doctorAddedPatients} doctor-added patients</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="ops-card">
          <div className="ops-section-head">
            <h2>Patients Added by Doctors</h2>
            <span className="ops-chip">Doctor App Source</span>
          </div>
          <div className="ops-summary-list">
            {doctorAddedPatients.map((item) => (
              <article key={item.patient} className="ops-summary-item">
                <div>
                  <strong>{item.patient}</strong>
                  <p>{item.doctor}</p>
                </div>
                <div>
                  <strong>{item.bookedOpds} OPDs</strong>
                  <p>{item.latestBooking}</p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Assigned Employee</th>
              <th>Company</th>
              <th>Type</th>
              <th>Status</th>
              <th>Doctor Review</th>
              <th>Employee Review</th>
              <th>Credits</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {searchedActiveTimeline.map((item) => (
              <tr key={item.id}>
                <td>{item.doctor}</td>
                <td>{item.employee}</td>
                <td>{item.company}</td>
                <td>{item.id.startsWith("TEL") ? "Teleconsultation" : "OPD"}</td>
                <td><span className={`ops-chip ${statusClass(item.status)}`}>{item.status}</span></td>
                <td>{item.reviewByDoctor}</td>
                <td>{item.reviewByEmployee}</td>
                <td>{formatCredits(item.credits)}</td>
                <td>{formatINR(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
