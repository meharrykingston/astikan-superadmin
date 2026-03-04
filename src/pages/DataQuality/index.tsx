import { ModuleStub } from "../../components/ModuleStub"
import "./data-quality.css"

export function DataQualityPage() {
  return (
    <div className="data-quality-page">
      <ModuleStub
        title="Data Quality and Sync Ops"
        subtitle="Track sync failures, retries, and entity reconciliation."
        primaryAction="Run Reconciliation"
      />
    </div>
  )
}
