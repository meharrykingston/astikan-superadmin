import "../operations.css"

const medicines = [
  { code: "MED-1001", name: "Atorvastatin 10mg", status: "Active", pack: "10 tablets", margin: "14%" },
  { code: "MED-1104", name: "Metformin 500mg", status: "Active", pack: "15 tablets", margin: "12%" },
  { code: "MED-2088", name: "Insulin Pen Kit", status: "Pending QC", pack: "1 kit", margin: "8%" },
]

const orders = [
  { id: "PO-5571", customer: "Emp-2102", amount: "₹1,450", state: "Packed", eta: "18 min" },
  { id: "PO-5572", customer: "Emp-1023", amount: "₹760", state: "Out for Delivery", eta: "9 min" },
  { id: "PO-5573", customer: "Emp-9014", amount: "₹2,340", state: "Payment Pending", eta: "-" },
]

export function PharmacyOperationsPage() {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Medicine Catalog & Orders</h1>
        <p>Add medicines, manage stock, and process pharmacy orders in one place.</p>
      </header>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Medicine Catalog</h2>
          <div className="ops-kpi">2,870</div>
          <div className="ops-kpi-sub">47 pending QA updates</div>
        </article>
        <article className="ops-card">
          <h2>Orders Today</h2>
          <div className="ops-kpi">1,126</div>
          <div className="ops-kpi-sub">94.2% fulfilled in SLA</div>
        </article>
      </section>

      <section className="ops-actions">
        <button type="button" className="primary">Add Medicine</button>
        <button type="button">Upload Bulk Medicine List</button>
        <button type="button">Create Purchase Order</button>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Medicine</th>
              <th>Pack</th>
              <th>Margin</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((item) => (
              <tr key={item.code}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.pack}</td>
                <td>{item.margin}</td>
                <td><span className={`ops-chip ${item.status === "Active" ? "success" : "warning"}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.customer}</td>
                <td>{item.amount}</td>
                <td><span className={`ops-chip ${item.state === "Payment Pending" ? "danger" : "success"}`}>{item.state}</span></td>
                <td>{item.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
