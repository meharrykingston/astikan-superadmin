import { ModuleStub } from "../../components/ModuleStub"
import "./compliance.css"

export function CompliancePage() {
  return (
    <div className="compliance-page">
      <ModuleStub
        title="Compliance and Security"
        subtitle="Access audit trails, retention policies, and consent controls."
        primaryAction="Review Audits"
      />
    </div>
  )
}
