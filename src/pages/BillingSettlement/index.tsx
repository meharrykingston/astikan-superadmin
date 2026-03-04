import { ModuleStub } from "../../components/ModuleStub"
import "./billing-settlement.css"

export function BillingSettlementPage() {
  return (
    <div className="billing-settlement-page">
      <ModuleStub
        title="Billing and Settlement"
        subtitle="Control invoices, usage meters, and tenant payout flows."
        primaryAction="Generate Invoice"
      />
    </div>
  )
}
