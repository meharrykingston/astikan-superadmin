import { ModuleStub } from "../../components/ModuleStub"
import "./integrations.css"

export function IntegrationsPage() {
  return (
    <div className="integrations-page">
      <ModuleStub
        title="Integrations Control Tower"
        subtitle="Monitor payroll, lab, teleconsult, and partner API connectors."
        primaryAction="Add Integration"
      />
    </div>
  )
}
