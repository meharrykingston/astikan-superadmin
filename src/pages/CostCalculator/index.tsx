import { useMemo, useState } from "react"
import "../operations.css"

export function CostCalculatorPage() {
  const [employeeCount, setEmployeeCount] = useState(200)
  const [budgetPerEmployee, setBudgetPerEmployee] = useState(2000)

  const [teleBudgetPerEmployee, setTeleBudgetPerEmployee] = useState(600)
  const [teleUnitCost, setTeleUnitCost] = useState(300)

  const [opdBudgetPerEmployee, setOpdBudgetPerEmployee] = useState(400)
  const [opdUnitCost, setOpdUnitCost] = useState(500)

  const [pharmacyBudgetPerEmployee, setPharmacyBudgetPerEmployee] = useState(600)
  const [pharmacyUnitCost, setPharmacyUnitCost] = useState(300)

  const [labBudgetPerEmployee, setLabBudgetPerEmployee] = useState(400)
  const [labUnitCost, setLabUnitCost] = useState(500)

  const parsed = useMemo(() => {
    const clamp = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0)
    const employeeTotal = clamp(employeeCount)
    const annualBudget = clamp(budgetPerEmployee)
    const totalBudget = employeeTotal * annualBudget

    const teleBudget = clamp(teleBudgetPerEmployee)
    const teleCost = clamp(teleUnitCost)
    const opdBudget = clamp(opdBudgetPerEmployee)
    const opdCost = clamp(opdUnitCost)
    const pharmacyBudget = clamp(pharmacyBudgetPerEmployee)
    const pharmacyCost = clamp(pharmacyUnitCost)
    const labBudget = clamp(labBudgetPerEmployee)
    const labCost = clamp(labUnitCost)

    const allocPerEmployee = teleBudget + opdBudget + pharmacyBudget + labBudget
    const allocTotal = allocPerEmployee * employeeTotal

    const remainingPerEmployee = annualBudget - allocPerEmployee
    const remainingTotal = totalBudget - allocTotal

    const teleCountPerEmployee = teleCost ? teleBudget / teleCost : 0
    const opdCountPerEmployee = opdCost ? opdBudget / opdCost : 0
    const pharmacyCountPerEmployee = pharmacyCost ? pharmacyBudget / pharmacyCost : 0
    const labCountPerEmployee = labCost ? labBudget / labCost : 0

    return {
      employeeTotal,
      annualBudget,
      totalBudget,
      allocPerEmployee,
      allocTotal,
      remainingPerEmployee,
      remainingTotal,
      teleCountPerEmployee,
      opdCountPerEmployee,
      pharmacyCountPerEmployee,
      labCountPerEmployee,
    }
  }, [
    employeeCount,
    budgetPerEmployee,
    teleBudgetPerEmployee,
    teleUnitCost,
    opdBudgetPerEmployee,
    opdUnitCost,
    pharmacyBudgetPerEmployee,
    pharmacyUnitCost,
    labBudgetPerEmployee,
    labUnitCost,
  ])

  const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)

  const toNum = (value: string) => Number(value.replace(/[^0-9.]/g, ""))

  return (
    <main className="ops-page ops-cost-calculator">
      <header className="ops-head">
        <h1>Corporate Health Cost Calculator</h1>
        <p>Estimate annual budgets, allocation, and service coverage per employee.</p>
      </header>

      <section className="ops-grid ops-grid--2">
        <article className="ops-card">
          <h2>Company Budget</h2>
          <div className="ops-field">
            <span>Employee Count</span>
            <input
              type="number"
              min={1}
              value={employeeCount}
              onChange={(event) => setEmployeeCount(toNum(event.target.value))}
              placeholder="e.g. 200"
            />
          </div>
          <div className="ops-field">
            <span>Annual Budget / Employee (INR)</span>
            <input
              type="number"
              min={0}
              value={budgetPerEmployee}
              onChange={(event) => setBudgetPerEmployee(toNum(event.target.value))}
              placeholder="e.g. 2000"
            />
          </div>
          <div className="ops-subsection">
            <h3>Budget Totals</h3>
            <div className="ops-grid ops-grid--2">
              <div>
                <div className="ops-kpi">{money(parsed.totalBudget)}</div>
                <div className="ops-kpi-sub">Total Annual Budget</div>
              </div>
              <div>
                <div className="ops-kpi">{money(parsed.annualBudget)}</div>
                <div className="ops-kpi-sub">Per Employee / Year</div>
              </div>
            </div>
          </div>
        </article>

        <article className="ops-card">
          <h2>Benefit Allocation</h2>
          <div className="ops-field">
            <span>Teleconsult Budget / Employee (INR)</span>
            <input
              type="number"
              min={0}
              value={teleBudgetPerEmployee}
              onChange={(event) => setTeleBudgetPerEmployee(toNum(event.target.value))}
            />
          </div>
          <div className="ops-field">
            <span>Teleconsult Cost / Visit (INR)</span>
            <input
              type="number"
              min={0}
              value={teleUnitCost}
              onChange={(event) => setTeleUnitCost(toNum(event.target.value))}
            />
          </div>

          <div className="ops-field">
            <span>OPD Budget / Employee (INR)</span>
            <input
              type="number"
              min={0}
              value={opdBudgetPerEmployee}
              onChange={(event) => setOpdBudgetPerEmployee(toNum(event.target.value))}
            />
          </div>
          <div className="ops-field">
            <span>OPD Cost / Visit (INR)</span>
            <input
              type="number"
              min={0}
              value={opdUnitCost}
              onChange={(event) => setOpdUnitCost(toNum(event.target.value))}
            />
          </div>

          <div className="ops-field">
            <span>Pharmacy Budget / Employee (INR)</span>
            <input
              type="number"
              min={0}
              value={pharmacyBudgetPerEmployee}
              onChange={(event) => setPharmacyBudgetPerEmployee(toNum(event.target.value))}
            />
          </div>
          <div className="ops-field">
            <span>Pharmacy Average Order (INR)</span>
            <input
              type="number"
              min={0}
              value={pharmacyUnitCost}
              onChange={(event) => setPharmacyUnitCost(toNum(event.target.value))}
            />
          </div>

          <div className="ops-field">
            <span>Lab Budget / Employee (INR)</span>
            <input
              type="number"
              min={0}
              value={labBudgetPerEmployee}
              onChange={(event) => setLabBudgetPerEmployee(toNum(event.target.value))}
            />
          </div>
          <div className="ops-field">
            <span>Lab Test Average (INR)</span>
            <input
              type="number"
              min={0}
              value={labUnitCost}
              onChange={(event) => setLabUnitCost(toNum(event.target.value))}
            />
          </div>
        </article>
      </section>

      <section className="ops-card">
        <h2>Estimated Output</h2>
        <div className="ops-grid ops-grid--3">
          <div>
            <div className="ops-kpi">{money(parsed.allocTotal)}</div>
            <div className="ops-kpi-sub">Allocated Annual Cost</div>
          </div>
          <div>
            <div className="ops-kpi">{money(parsed.allocPerEmployee)}</div>
            <div className="ops-kpi-sub">Allocated / Employee</div>
          </div>
          <div>
            <div className="ops-kpi">{money(parsed.remainingTotal)}</div>
            <div className="ops-kpi-sub">Remaining Budget</div>
          </div>
        </div>
        <div className="ops-subsection">
          <h3>Service Coverage (Per Employee / Year)</h3>
          <div className="ops-grid ops-grid--4">
            <div>
              <strong>{parsed.teleCountPerEmployee.toFixed(1)}</strong>
              <div className="ops-kpi-sub">Teleconsult Visits</div>
            </div>
            <div>
              <strong>{parsed.opdCountPerEmployee.toFixed(1)}</strong>
              <div className="ops-kpi-sub">OPD Visits</div>
            </div>
            <div>
              <strong>{parsed.pharmacyCountPerEmployee.toFixed(1)}</strong>
              <div className="ops-kpi-sub">Pharmacy Orders</div>
            </div>
            <div>
              <strong>{parsed.labCountPerEmployee.toFixed(1)}</strong>
              <div className="ops-kpi-sub">Lab Tests</div>
            </div>
          </div>
        </div>
        <div className="ops-subsection">
          <h3>Totals For {parsed.employeeTotal} Employees</h3>
          <div className="ops-grid ops-grid--4">
            <div>
              <strong>{Math.round(parsed.teleCountPerEmployee * parsed.employeeTotal)}</strong>
              <div className="ops-kpi-sub">Teleconsult Visits</div>
            </div>
            <div>
              <strong>{Math.round(parsed.opdCountPerEmployee * parsed.employeeTotal)}</strong>
              <div className="ops-kpi-sub">OPD Visits</div>
            </div>
            <div>
              <strong>{Math.round(parsed.pharmacyCountPerEmployee * parsed.employeeTotal)}</strong>
              <div className="ops-kpi-sub">Pharmacy Orders</div>
            </div>
            <div>
              <strong>{Math.round(parsed.labCountPerEmployee * parsed.employeeTotal)}</strong>
              <div className="ops-kpi-sub">Lab Tests</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
