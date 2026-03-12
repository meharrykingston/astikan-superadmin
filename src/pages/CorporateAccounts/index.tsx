import { useMemo, useState } from "react"
import {
  Activity,
  Beaker,
  Building2,
  Clock3,
  CreditCard,
  FlaskConical,
  PackageCheck,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react"
import "../operations.css"
import "./corporate-accounts.css"

type Corporate = {
  id: string
  name: string
  contactPerson: string
  email: string
  plan: "Starter" | "Growth" | "Enterprise"
  employeeCount: number
  lockedCreditsPerEmployee: number
  creditBalance: number
  billingCycle: "Monthly" | "Quarterly" | "Yearly"
  paymentStatus: "Paid" | "Due" | "Overdue"
  creditsSpent: number
  labTestsUsed: number
  pendingLabTests: number
  ongoingLabTests: number
  inventoryAvailable: number
  inventoryReserved: number
  monthlyUtilization: Array<{ label: string; value: number }>
  employees: Array<{
    id: string
    name: string
    department: string
    creditsUsed: number
    lastService: string
    activeLabTest: string
    status: "Pending" | "In Progress" | "Completed"
  }>
}

const seedCorporates: Corporate[] = [
  {
    id: "corp-1001",
    name: "HCLTech",
    contactPerson: "Rahul Verma",
    email: "rahul.verma@hcl.com",
    plan: "Enterprise",
    employeeCount: 100,
    lockedCreditsPerEmployee: 25000,
    creditBalance: 42800,
    billingCycle: "Monthly",
    paymentStatus: "Due",
    creditsSpent: 185400,
    labTestsUsed: 162,
    pendingLabTests: 14,
    ongoingLabTests: 21,
    inventoryAvailable: 96,
    inventoryReserved: 34,
    monthlyUtilization: [
      { label: "Week 1", value: 52 },
      { label: "Week 2", value: 68 },
      { label: "Week 3", value: 84 },
      { label: "Week 4", value: 73 },
    ],
    employees: [
      {
        id: "EMP-HCL-001",
        name: "Ananya Mehta",
        department: "Engineering",
        creditsUsed: 12600,
        lastService: "Executive wellness panel",
        activeLabTest: "Vitamin D",
        status: "In Progress",
      },
      {
        id: "EMP-HCL-002",
        name: "Rohit Singh",
        department: "Operations",
        creditsUsed: 8900,
        lastService: "CBC + ESR",
        activeLabTest: "CBC",
        status: "Pending",
      },
      {
        id: "EMP-HCL-003",
        name: "Megha Iyer",
        department: "Finance",
        creditsUsed: 15400,
        lastService: "Thyroid profile",
        activeLabTest: "Thyroid Profile",
        status: "Completed",
      },
    ],
  },
  {
    id: "corp-1002",
    name: "Aster Pharma",
    contactPerson: "Meera Nair",
    email: "meera.nair@asterpharma.com",
    plan: "Growth",
    employeeCount: 52,
    lockedCreditsPerEmployee: 20000,
    creditBalance: 18200,
    billingCycle: "Quarterly",
    paymentStatus: "Paid",
    creditsSpent: 96400,
    labTestsUsed: 91,
    pendingLabTests: 9,
    ongoingLabTests: 11,
    inventoryAvailable: 58,
    inventoryReserved: 17,
    monthlyUtilization: [
      { label: "Week 1", value: 41 },
      { label: "Week 2", value: 55 },
      { label: "Week 3", value: 49 },
      { label: "Week 4", value: 62 },
    ],
    employees: [
      {
        id: "EMP-AST-001",
        name: "Sahil Khan",
        department: "Plant Ops",
        creditsUsed: 7200,
        lastService: "LFT panel",
        activeLabTest: "Liver Function Test",
        status: "Pending",
      },
      {
        id: "EMP-AST-002",
        name: "Divya Menon",
        department: "Quality",
        creditsUsed: 11400,
        lastService: "HbA1c screening",
        activeLabTest: "HbA1c",
        status: "In Progress",
      },
      {
        id: "EMP-AST-003",
        name: "Arjun Pillai",
        department: "Sales",
        creditsUsed: 9500,
        lastService: "Fever profile",
        activeLabTest: "CRP",
        status: "Completed",
      },
    ],
  },
]

const COIN_VALUE_DIVISOR = 10

function formatINR(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`
}

function makeDefaultCorporate(data: {
  name: string
  contactPerson: string
  email: string
  plan: Corporate["plan"]
  employeeCount: number
  lockedCreditsPerEmployee: number
  billingCycle: Corporate["billingCycle"]
  creditBalance: number
}): Corporate {
  return {
    id: `corp-${Date.now()}`,
    name: data.name,
    contactPerson: data.contactPerson,
    email: data.email,
    plan: data.plan,
    employeeCount: data.employeeCount,
    lockedCreditsPerEmployee: data.lockedCreditsPerEmployee,
    creditBalance: data.creditBalance,
    billingCycle: data.billingCycle,
    paymentStatus: "Due",
    creditsSpent: Math.round(data.employeeCount * 920),
    labTestsUsed: Math.max(8, Math.round(data.employeeCount * 0.7)),
    pendingLabTests: Math.max(2, Math.round(data.employeeCount * 0.08)),
    ongoingLabTests: Math.max(3, Math.round(data.employeeCount * 0.12)),
    inventoryAvailable: Math.max(20, Math.round(data.employeeCount * 0.6)),
    inventoryReserved: Math.max(8, Math.round(data.employeeCount * 0.18)),
    monthlyUtilization: [
      { label: "Week 1", value: 42 },
      { label: "Week 2", value: 58 },
      { label: "Week 3", value: 64 },
      { label: "Week 4", value: 71 },
    ],
    employees: [
      {
        id: `EMP-${data.name.slice(0, 3).toUpperCase()}-001`,
        name: "Primary Employee",
        department: "General",
        creditsUsed: 5400,
        lastService: "Executive health package",
        activeLabTest: "CBC",
        status: "Pending",
      },
    ],
  }
}

export function CorporateAccountsPage() {
  const [corporates, setCorporates] = useState<Corporate[]>(seedCorporates)
  const [selectedCorporateId, setSelectedCorporateId] = useState(seedCorporates[0]?.id ?? "")
  const [creditAddInput, setCreditAddInput] = useState("")
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    plan: "Starter" as Corporate["plan"],
    employeeCount: "",
    lockedCreditsPerEmployee: "25000",
    billingCycle: "Monthly" as Corporate["billingCycle"],
    creditBalance: "",
  })
  const [lastPaymentAction, setLastPaymentAction] = useState("")

  const selectedCorporate = corporates.find((corp) => corp.id === selectedCorporateId) ?? null
  const preferredMinimumCredits = selectedCorporate
    ? selectedCorporate.employeeCount * selectedCorporate.lockedCreditsPerEmployee
    : 0
  const preferredMinimumAmount = Math.ceil(preferredMinimumCredits / COIN_VALUE_DIVISOR)
  const customCredits = Number(creditAddInput) || 0
  const customAmount = Math.ceil(customCredits / COIN_VALUE_DIVISOR)

  const totals = useMemo(() => {
    return corporates.reduce(
      (acc, corporate) => {
        acc.employees += corporate.employeeCount
        acc.credits += corporate.creditBalance
        acc.spent += corporate.creditsSpent
        acc.labs += corporate.labTestsUsed
        return acc
      },
      { employees: 0, credits: 0, spent: 0, labs: 0 }
    )
  }, [corporates])

  function addCorporate() {
    if (!form.name.trim() || !form.contactPerson.trim() || !form.email.trim()) {
      return
    }
    const next = makeDefaultCorporate({
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim(),
      plan: form.plan,
      employeeCount: Number(form.employeeCount) || 0,
      lockedCreditsPerEmployee: Number(form.lockedCreditsPerEmployee) || 25000,
      billingCycle: form.billingCycle,
      creditBalance: Number(form.creditBalance) || 0,
    })
    setCorporates((prev) => [next, ...prev])
    setSelectedCorporateId(next.id)
    setForm({
      name: "",
      contactPerson: "",
      email: "",
      plan: "Starter",
      employeeCount: "",
      lockedCreditsPerEmployee: "25000",
      billingCycle: "Monthly",
      creditBalance: "",
    })
  }

  function sendRefillPaymentLink(corporate: Corporate, creditsToBuy: number) {
    const payable = Math.ceil(creditsToBuy / COIN_VALUE_DIVISOR)
    setLastPaymentAction(
      `Refill payment link sent to ${corporate.email} for ${corporate.name}. Credits: ${creditsToBuy.toLocaleString()} | Amount: INR ${payable.toLocaleString()}.`
    )
  }

  function applyQuickRefill(credits: number) {
    if (!selectedCorporate) return
    sendRefillPaymentLink(selectedCorporate, credits)
  }

  const topEmployees = selectedCorporate
    ? [...selectedCorporate.employees].sort((a, b) => b.creditsUsed - a.creditsUsed)
    : []

  return (
    <main className="ops-page corporate-page">
      <header className="ops-head">
        <h1>Corporate Accounts</h1>
        <p>
          Select a corporate and inspect credits, utilization, employee-level lab activity, live
          inventory, and refill exposure in one place.
        </p>
      </header>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Total Corporates</h2>
          <div className="ops-kpi">{corporates.length}</div>
          <div className="ops-kpi-sub">Active corporate clients on platform</div>
        </article>
        <article className="ops-card">
          <h2>Total Employees Covered</h2>
          <div className="ops-kpi">{totals.employees.toLocaleString("en-IN")}</div>
          <div className="ops-kpi-sub">Payroll-linked employee base across all corporates</div>
        </article>
      </section>

      <section className="corporate-selector-shell">
        <article className="corporate-command-card">
          <div className="corporate-command-head">
            <div>
              <span className="corporate-kicker"><Building2 size={14} /> Corporate command center</span>
              <h2>Selected Corporate Intelligence</h2>
              <p>Switch any tenant and review consumption, pending tests, and employee-wise usage.</p>
            </div>
            <label className="corporate-picker">
              <span>Select Corporate</span>
              <select value={selectedCorporateId} onChange={(event) => setSelectedCorporateId(event.target.value)}>
                {corporates.map((corp) => (
                  <option key={corp.id} value={corp.id}>
                    {corp.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedCorporate ? (
            <>
              <div className="selected-corporate-head">
                <div>
                  <h3>{selectedCorporate.name}</h3>
                  <p>
                    {selectedCorporate.contactPerson} • {selectedCorporate.email} • {selectedCorporate.plan} plan
                  </p>
                </div>
                <span
                  className={`ops-chip ${
                    selectedCorporate.paymentStatus === "Paid"
                      ? "success"
                      : selectedCorporate.paymentStatus === "Due"
                        ? "warning"
                        : "danger"
                  }`}
                >
                  {selectedCorporate.paymentStatus}
                </span>
              </div>

              <div className="corporate-insight-grid">
                <article className="corporate-insight-card">
                  <span><CreditCard size={16} /> Credit balance</span>
                  <strong>{selectedCorporate.creditBalance.toLocaleString("en-IN")}</strong>
                  <small>Available in corporate pool</small>
                </article>
                <article className="corporate-insight-card">
                  <span><TrendingUp size={16} /> Credits spent</span>
                  <strong>{selectedCorporate.creditsSpent.toLocaleString("en-IN")}</strong>
                  <small>Consumed across employee services</small>
                </article>
                <article className="corporate-insight-card">
                  <span><Users size={16} /> Employees</span>
                  <strong>{selectedCorporate.employeeCount}</strong>
                  <small>Payroll linked users</small>
                </article>
                <article className="corporate-insight-card">
                  <span><FlaskConical size={16} /> Lab tests used</span>
                  <strong>{selectedCorporate.labTestsUsed}</strong>
                  <small>Total booked tests</small>
                </article>
                <article className="corporate-insight-card">
                  <span><Clock3 size={16} /> Pending lab tests</span>
                  <strong>{selectedCorporate.pendingLabTests}</strong>
                  <small>Collection or scheduling pending</small>
                </article>
                <article className="corporate-insight-card">
                  <span><Activity size={16} /> Ongoing lab tests</span>
                  <strong>{selectedCorporate.ongoingLabTests}</strong>
                  <small>Currently processing</small>
                </article>
              </div>

              <div className="corporate-detail-grid">
                <section className="corporate-panel-card">
                  <div className="corporate-panel-head">
                    <h3>Credit & Inventory Analytics</h3>
                    <span>{selectedCorporate.billingCycle} cycle</span>
                  </div>
                  <div className="corporate-mini-kpis">
                    <article>
                      <small>Locked reserve</small>
                      <strong>{preferredMinimumCredits.toLocaleString("en-IN")}</strong>
                    </article>
                    <article>
                      <small>Inventory available</small>
                      <strong>{selectedCorporate.inventoryAvailable}</strong>
                    </article>
                    <article>
                      <small>Inventory reserved</small>
                      <strong>{selectedCorporate.inventoryReserved}</strong>
                    </article>
                  </div>
                  <div className="corporate-bars">
                    {selectedCorporate.monthlyUtilization.map((item) => (
                      <div key={item.label} className="corporate-bar-row">
                        <div>
                          <span>{item.label}</span>
                          <b>{item.value}%</b>
                        </div>
                        <i style={{ width: `${item.value}%` }} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="corporate-panel-card">
                  <div className="corporate-panel-head">
                    <h3>Lab Ops Snapshot</h3>
                    <span>Detailed operational view</span>
                  </div>
                  <div className="corporate-op-grid">
                    <article>
                      <Beaker size={16} />
                      <div>
                        <strong>{selectedCorporate.labTestsUsed}</strong>
                        <small>Tests consumed</small>
                      </div>
                    </article>
                    <article>
                      <Clock3 size={16} />
                      <div>
                        <strong>{selectedCorporate.pendingLabTests}</strong>
                        <small>Pending scheduling</small>
                      </div>
                    </article>
                    <article>
                      <ReceiptText size={16} />
                      <div>
                        <strong>{selectedCorporate.ongoingLabTests}</strong>
                        <small>In processing</small>
                      </div>
                    </article>
                    <article>
                      <PackageCheck size={16} />
                      <div>
                        <strong>{selectedCorporate.inventoryAvailable + selectedCorporate.inventoryReserved}</strong>
                        <small>Total mapped inventory</small>
                      </div>
                    </article>
                  </div>
                </section>
              </div>

              <section className="corporate-panel-card">
                <div className="corporate-panel-head">
                  <h3>Employee-wise Service Usage</h3>
                  <span>Who is using what right now</span>
                </div>
                <div className="corporate-employee-table">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Credits Used</th>
                        <th>Last Service</th>
                        <th>Current Test</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            {employee.name}
                            <br />
                            {employee.id}
                          </td>
                          <td>{employee.department}</td>
                          <td>{employee.creditsUsed.toLocaleString("en-IN")}</td>
                          <td>{employee.lastService}</td>
                          <td>{employee.activeLabTest}</td>
                          <td>
                            <span
                              className={`ops-chip ${
                                employee.status === "Completed"
                                  ? "success"
                                  : employee.status === "Pending"
                                    ? "warning"
                                    : ""
                              }`}
                            >
                              {employee.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </article>
      </section>

      <section className="ops-card">
        <h2>Add Corporate</h2>
        <div className="ops-grid">
          <label>
            Corporate Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Company legal name"
            />
          </label>
          <label>
            Contact Person
            <input
              value={form.contactPerson}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))}
              placeholder="Primary SPOC"
            />
          </label>
          <label>
            Contact Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="billing@company.com"
            />
          </label>
          <label>
            Plan
            <select value={form.plan} onChange={(event) => setForm((prev) => ({ ...prev, plan: event.target.value as Corporate["plan"] }))}>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </label>
          <label>
            Employees in Payroll
            <input
              type="number"
              value={form.employeeCount}
              onChange={(event) => setForm((prev) => ({ ...prev, employeeCount: event.target.value }))}
              placeholder="100"
            />
          </label>
          <label>
            Locked Credits per Employee
            <input
              type="number"
              value={form.lockedCreditsPerEmployee}
              onChange={(event) => setForm((prev) => ({ ...prev, lockedCreditsPerEmployee: event.target.value }))}
              placeholder="25000"
            />
          </label>
          <label>
            Billing Cycle
            <select
              value={form.billingCycle}
              onChange={(event) => setForm((prev) => ({ ...prev, billingCycle: event.target.value as Corporate["billingCycle"] }))}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </label>
          <label>
            Initial Credits
            <input
              type="number"
              value={form.creditBalance}
              onChange={(event) => setForm((prev) => ({ ...prev, creditBalance: event.target.value }))}
              placeholder="0"
            />
          </label>
        </div>
        <div className="ops-actions">
          <button type="button" className="primary" onClick={addCorporate}>Add Corporate</button>
        </div>
        {lastPaymentAction ? <div className="ops-kpi-sub">{lastPaymentAction}</div> : null}
      </section>

      <section className="ops-card">
        <h2>Credits Refill Planner</h2>
        <div className="ops-grid">
          <label>
            Select Corporate
            <select value={selectedCorporateId} onChange={(event) => setSelectedCorporateId(event.target.value)}>
              {corporates.map((corp) => (
                <option key={corp.id} value={corp.id}>
                  {corp.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Payroll Employees
            <input type="number" value={selectedCorporate?.employeeCount ?? 0} readOnly />
          </label>
          <label>
            Preferred Minimum Credits
            <input type="text" value={preferredMinimumCredits.toLocaleString("en-IN")} readOnly />
          </label>
          <label>
            Preferred Minimum Buy
            <input type="text" value={formatINR(preferredMinimumAmount)} readOnly />
          </label>
        </div>
        <div className="ops-actions">
          <button type="button" onClick={() => applyQuickRefill(100000)}>Add 100,000 Credits</button>
          <button type="button" onClick={() => applyQuickRefill(200000)}>Add 200,000 Credits</button>
          <button
            type="button"
            className="primary"
            onClick={() => selectedCorporate && applyQuickRefill(preferredMinimumCredits)}
            disabled={!selectedCorporate}
          >
            Use Preferred Minimum
          </button>
        </div>
        <div className="ops-grid">
          <label>
            Custom Credits to Add
            <input
              type="number"
              value={creditAddInput}
              onChange={(event) => setCreditAddInput(event.target.value)}
              placeholder="Enter custom credits"
            />
          </label>
          <label>
            Estimated Payable
            <input type="text" value={formatINR(customAmount)} readOnly />
          </label>
        </div>
        <div className="ops-actions">
          <button
            type="button"
            className="primary"
            onClick={() => selectedCorporate && customCredits > 0 && sendRefillPaymentLink(selectedCorporate, customCredits)}
            disabled={!selectedCorporate || customCredits <= 0}
          >
            Send Custom Refill Link
          </button>
        </div>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Corporate</th>
              <th>Contact</th>
              <th>Plan</th>
              <th>Employees</th>
              <th>Credits</th>
              <th>Lab Tests</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {corporates.map((corporate) => (
              <tr key={corporate.id}>
                <td>{corporate.name}</td>
                <td>
                  {corporate.contactPerson}
                  <br />
                  {corporate.email}
                </td>
                <td>{corporate.plan}</td>
                <td>{corporate.employeeCount}</td>
                <td>{corporate.creditBalance.toLocaleString("en-IN")}</td>
                <td>{corporate.labTestsUsed}</td>
                <td>
                  <span
                    className={`ops-chip ${
                      corporate.paymentStatus === "Paid"
                        ? "success"
                        : corporate.paymentStatus === "Due"
                          ? "warning"
                          : "danger"
                    }`}
                  >
                    {corporate.paymentStatus}
                  </span>
                </td>
                <td className="ops-actions">
                  <button type="button" onClick={() => setSelectedCorporateId(corporate.id)}>
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      sendRefillPaymentLink(
                        corporate,
                        corporate.employeeCount * corporate.lockedCreditsPerEmployee || 100000
                      )
                    }
                    className="primary"
                  >
                    Send Refill Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
