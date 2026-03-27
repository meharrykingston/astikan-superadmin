import "../operations.css"

type PayrollPageProps = {
  subtitle?: string
}

export function PayrollPage({ subtitle }: PayrollPageProps) {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Payroll</h1>
        {subtitle ? <p className="ops-kpi-sub">{subtitle}</p> : null}
      </header>
    </main>
  )
}
