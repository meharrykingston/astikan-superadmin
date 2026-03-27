import "../operations.css"

const products = [
  { sku: "DP-101", name: "Doctor Stethoscope Pro", category: "Equipment", price: "₹3,400", visibility: "All Doctors", stock: 124 },
  { sku: "DP-203", name: "Teleconsult Starter Kit", category: "Telehealth", price: "₹5,800", visibility: "Approved Doctors", stock: 42 },
  { sku: "DP-333", name: "ECG Patch Bundle", category: "Diagnostics", price: "₹2,250", visibility: "Cardiology Only", stock: 68 },
]

export function DoctorProductsPage() {
  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Products Catalog</h1>
        <p>Manage the corporate health products available across plans and specialties.</p>
      </header>

      <section className="ops-actions">
        <button type="button" className="primary">Add Product</button>
        <button type="button">Create Category</button>
        <button type="button">Export Catalog</button>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Visibility</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.sku}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.price}</td>
                <td><span className="ops-chip">{item.visibility}</span></td>
                <td>{item.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
