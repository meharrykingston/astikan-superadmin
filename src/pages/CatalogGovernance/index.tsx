import { ModuleStub } from "../../components/ModuleStub"
import "./catalog-governance.css"

export function CatalogGovernancePage() {
  return (
    <div className="catalog-governance-page">
      <ModuleStub
        title="Catalog Governance"
        subtitle="Manage global lab categories, aliases, and display policies."
        primaryAction="Update Catalog"
      />
    </div>
  )
}
