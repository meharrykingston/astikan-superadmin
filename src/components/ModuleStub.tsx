import "./module-stub.css"

type ModuleStubProps = {
  title: string
  subtitle: string
  primaryAction?: string
}

export function ModuleStub({ title, subtitle, primaryAction }: ModuleStubProps) {
  return (
    <main className="module-page">
      <header className="module-head">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <section className="module-card">
        <h2>Stub Ready</h2>
        <p>
          This page is scaffolded for API integration and business logic.
        </p>
        {primaryAction && <button type="button">{primaryAction}</button>}
      </section>
    </main>
  )
}
