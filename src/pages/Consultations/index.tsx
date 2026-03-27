import "../operations.css"

type ConsultationsPageProps = {
  title?: string
  subtitle?: string
}

export function ConsultationsPage({ title = "Consultations", subtitle }: ConsultationsPageProps) {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>{title}</h1>
        {subtitle ? <p className="ops-kpi-sub">{subtitle}</p> : null}
      </header>
    </main>
  )
}
