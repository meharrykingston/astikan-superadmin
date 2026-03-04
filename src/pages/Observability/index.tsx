import { ModuleStub } from "../../components/ModuleStub"
import "./observability.css"

export function ObservabilityPage() {
  return (
    <div className="observability-page">
      <ModuleStub
        title="Observability and Incident Desk"
        subtitle="See live API health, latency, failures, and incidents."
        primaryAction="Open Incident"
      />
    </div>
  )
}
