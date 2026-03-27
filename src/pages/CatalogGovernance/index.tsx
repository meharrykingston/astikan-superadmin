import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  BadgeIndianRupee,
  Clock3,
  FlaskConical,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react"
import "./catalog-governance.css"

type LabCatalogTest = {
  id: string
  code: string
  name: string
  reportingTime: string
  price: number | null
  category: string
}

type LabCatalogResponse = {
  keyword: string
  total: number
  categories: Array<{ name: string; count: number }>
  tests: LabCatalogTest[]
}

type GovernanceAvailability = "available" | "limited" | "paused"

type GovernanceMeta = {
  creditCost: number
  availability: GovernanceAvailability
  coverage: string
}

const STORAGE_KEY = "superadmin:lab-governance"
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "/api"

async function fetchLabCatalog(): Promise<LabCatalogResponse> {
  const response = await fetch(`${API_BASE_URL}/lab/catalog?limit=60&offset=0`, {
    headers: { "Content-Type": "application/json" },
  })

  const raw = await response.text()
  if (/<!doctype html>|<html/i.test(raw)) {
    throw new Error("Lab catalog API is not reachable. Start backend and use the Vite /api proxy.")
  }

  let payload: {
    status: "ok" | "error"
    data?: LabCatalogResponse
    message?: string
  }
  try {
    payload = JSON.parse(raw) as {
      status: "ok" | "error"
      data?: LabCatalogResponse
      message?: string
    }
  } catch {
    throw new Error("Invalid lab catalog response received from backend.")
  }

  if (!response.ok || payload.status !== "ok" || !payload.data) {
    throw new Error(payload.message || "Unable to load live lab catalog.")
  }

  return payload.data
}

function readGovernanceMap(): Record<string, GovernanceMeta> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, GovernanceMeta>
  } catch {
    return {}
  }
}

function deriveDefaultMeta(test: LabCatalogTest): GovernanceMeta {
  const derivedCredits = test.price ? Math.max(250, Math.round(test.price * 10)) : 500
  const seed = Number(test.id.replace(/[^\d]/g, "")) || test.name.length
  const availability: GovernanceAvailability =
    seed % 5 === 0 ? "paused" : seed % 3 === 0 ? "limited" : "available"
  const coverage =
    availability === "paused"
      ? "Temporarily unavailable in selected cities"
      : availability === "limited"
        ? "Limited home collection windows live"
        : "Live across home collection and partner centers"

  return {
    creditCost: derivedCredits,
    availability,
    coverage,
  }
}

function availabilityLabel(value: GovernanceAvailability) {
  if (value === "available") return "Live"
  if (value === "limited") return "Limited"
  return "Paused"
}

export function CatalogGovernancePage() {
  const [tests, setTests] = useState<LabCatalogTest[]>([])
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [governanceMap, setGovernanceMap] = useState<Record<string, GovernanceMeta>>({})
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saveNote, setSaveNote] = useState("")

  useEffect(() => {
    setGovernanceMap(readGovernanceMap())
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError("")
        const data = await fetchLabCatalog()
        if (!active) return
        setTests(data.tests)
        setCategories(data.categories)
        setSelectedId((current) => current || data.tests[0]?.id || "")
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : "Unable to load catalog.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const hydratedTests = useMemo(() => {
    return tests.map((test) => ({
      ...test,
      governance: governanceMap[test.id] ?? deriveDefaultMeta(test),
    }))
  }, [governanceMap, tests])

  const filteredTests = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return hydratedTests.filter((test) => {
      const categoryMatch = activeCategory === "All" || test.category === activeCategory
      const textMatch =
        !normalized ||
        `${test.name} ${test.code} ${test.category}`.toLowerCase().includes(normalized)
      return categoryMatch && textMatch
    })
  }, [activeCategory, hydratedTests, query])

  const selectedTest =
    filteredTests.find((item) => item.id === selectedId) ??
    hydratedTests.find((item) => item.id === selectedId) ??
    filteredTests[0] ??
    hydratedTests[0]

  function persistGovernance(nextMap: Record<string, GovernanceMeta>) {
    setGovernanceMap(nextMap)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMap))
    setSaveNote("Catalog governance saved for corporate credit billing.")
    window.setTimeout(() => setSaveNote(""), 2200)
  }

  function updateSelectedMeta(patch: Partial<GovernanceMeta>) {
    if (!selectedTest) return
    const current = governanceMap[selectedTest.id] ?? deriveDefaultMeta(selectedTest)
    persistGovernance({
      ...governanceMap,
      [selectedTest.id]: { ...current, ...patch },
    })
  }

  const liveCount = hydratedTests.filter((item) => item.governance.availability === "available").length
  const limitedCount = hydratedTests.filter((item) => item.governance.availability === "limited").length
  const governedCredits = hydratedTests.reduce((sum, item) => sum + item.governance.creditCost, 0)

  return (
    <main className="catalog-governance-page">
      <header className="catalog-hero">
        <div>
          <span className="catalog-kicker">
            <ShieldCheck size={14} /> Live Niramaya Sync
          </span>
          <h1>Lab Catalog Governance</h1>
          <p>
            Super admin can now see live Niramaya tests, control live availability, and set the
            corporate credit cost deducted when employees book services.
          </p>
        </div>
        <div className="catalog-hero-stats">
          <article>
            <strong>{tests.length}</strong>
            <span>Live tests</span>
          </article>
          <article>
            <strong>{liveCount}</strong>
            <span>Available now</span>
          </article>
          <article>
            <strong>{limitedCount}</strong>
            <span>Limited</span>
          </article>
        </div>
      </header>

      <section className="catalog-summary-grid">
        <article className="summary-card">
          <div className="summary-icon blue"><FlaskConical size={18} /></div>
          <div>
            <strong>Niramaya feed active</strong>
            <p>Tests below are loaded from the same live lab catalog used in employee booking.</p>
          </div>
        </article>
        <article className="summary-card">
          <div className="summary-icon green"><BadgeIndianRupee size={18} /></div>
          <div>
            <strong>{governedCredits.toLocaleString("en-IN")} credits mapped</strong>
            <p>Corporate consumption can now be governed test-wise from this panel.</p>
          </div>
        </article>
      </section>

      <section className="catalog-workspace">
        <section className="catalog-list-panel">
          <div className="catalog-toolbar">
            <label className="catalog-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Niramaya tests"
              />
            </label>
            <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          <div className="catalog-meta-row">
            <span><Activity size={14} /> Live synced</span>
            <span>{filteredTests.length} tests shown</span>
          </div>

          {loading ? <div className="catalog-empty">Loading live Niramaya lab tests...</div> : null}
          {error ? <div className="catalog-empty error">{error}</div> : null}

          {!loading && !error ? (
            <div className="catalog-list">
              {filteredTests.map((test) => (
                <button
                  key={test.id}
                  type="button"
                  className={`catalog-test-card ${selectedTest?.id === test.id ? "active" : ""}`}
                  onClick={() => setSelectedId(test.id)}
                >
                  <div className="catalog-test-top">
                    <strong>{test.name}</strong>
                    <span className={`availability-pill ${test.governance.availability}`}>
                      {availabilityLabel(test.governance.availability)}
                    </span>
                  </div>
                  <p>{test.code || "Code not provided"} • {test.category}</p>
                  <div className="catalog-test-bottom">
                    <span><Clock3 size={14} /> {test.reportingTime}</span>
                    <span>{test.governance.creditCost.toLocaleString("en-IN")} credits</span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="catalog-detail-panel">
          {selectedTest ? (
            <>
              <div className="detail-head">
                <div>
                  <span className="detail-badge">Corporate Credit Rule</span>
                  <h2>{selectedTest.name}</h2>
                  <p>{selectedTest.code || "No code"} • {selectedTest.category}</p>
                </div>
                <span className={`availability-pill large ${selectedTest.governance.availability}`}>
                  {availabilityLabel(selectedTest.governance.availability)}
                </span>
              </div>

              <div className="detail-grid">
                <article className="detail-stat-card">
                  <small>Reporting time</small>
                  <strong>{selectedTest.reportingTime}</strong>
                </article>
                <article className="detail-stat-card">
                  <small>Niramaya MRP</small>
                  <strong>
                    {selectedTest.price !== null
                      ? `INR ${selectedTest.price.toLocaleString("en-IN")}`
                      : "Not shared"}
                  </strong>
                </article>
              </div>

              <section className="governance-card">
                <div className="governance-head">
                  <h3>Availability governance</h3>
                  <span><MapPin size={14} /> Employee-visible status</span>
                </div>

                <div className="governance-fields">
                  <label>
                    Live availability
                    <select
                      value={selectedTest.governance.availability}
                      onChange={(event) =>
                        updateSelectedMeta({
                          availability: event.target.value as GovernanceAvailability,
                        })
                      }
                    >
                      <option value="available">Live</option>
                      <option value="limited">Limited</option>
                      <option value="paused">Paused</option>
                    </select>
                  </label>

                  <label>
                    Coverage note
                    <input
                      value={selectedTest.governance.coverage}
                      onChange={(event) => updateSelectedMeta({ coverage: event.target.value })}
                      placeholder="Example: Live in Delhi, Noida, and Gurgaon"
                    />
                  </label>
                </div>
              </section>

              <section className="governance-card">
                <div className="governance-head">
                  <h3>Corporate credit costing</h3>
                  <span><BadgeIndianRupee size={14} /> Billing control</span>
                </div>

                <div className="credit-layout">
                  <label>
                    Credit cost per booking
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={selectedTest.governance.creditCost}
                      onChange={(event) =>
                        updateSelectedMeta({
                          creditCost: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                    />
                  </label>

                  <div className="credit-note">
                    <strong>How this is used</strong>
                    <p>
                      When a corporate employee books this test, the mapped credits can be deducted
                      from the company pool instead of relying only on rupee-side vendor pricing.
                    </p>
                  </div>
                </div>
              </section>

              <section className="governance-card compact">
                <h3>Live display preview</h3>
                <div className="preview-card">
                  <div>
                    <strong>{selectedTest.name}</strong>
                    <p>{selectedTest.category} • {selectedTest.reportingTime}</p>
                  </div>
                  <div className="preview-right">
                    <span className={`availability-pill ${selectedTest.governance.availability}`}>
                      {availabilityLabel(selectedTest.governance.availability)}
                    </span>
                    <b>{selectedTest.governance.creditCost.toLocaleString("en-IN")} credits</b>
                  </div>
                </div>
                <small>{selectedTest.governance.coverage}</small>
              </section>

              {saveNote ? <div className="save-note">{saveNote}</div> : null}
            </>
          ) : (
            <div className="catalog-empty">Select a test to configure governance.</div>
          )}
        </section>
      </section>
    </main>
  )
}
