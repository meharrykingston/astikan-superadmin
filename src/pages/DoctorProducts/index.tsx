import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useLocation } from "react-router-dom"
import "../operations.css"

const products = [
  { sku: "DP-101", name: "Doctor Stethoscope Pro", category: "Equipment", price: "₹3,400", visibility: "All Doctors", stock: 124 },
  { sku: "DP-203", name: "Teleconsult Starter Kit", category: "Telehealth", price: "₹5,800", visibility: "Approved Doctors", stock: 42 },
  { sku: "DP-333", name: "ECG Patch Bundle", category: "Diagnostics", price: "₹2,250", visibility: "Cardiology Only", stock: 68 },
]

export function DoctorProductsPage() {
  const { pathname } = useLocation()
  const isCategories = pathname.includes("/products/categories")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(timer)
  }, [pathname])

  const categories = useMemo(
    () => [
      { name: "Diagnostics", count: 34 },
      { name: "Telehealth", count: 18 },
      { name: "Equipment", count: 22 },
      { name: "Wellness", count: 12 },
      { name: "Monitoring", count: 9 },
      { name: "Preventive", count: 15 },
    ],
    []
  )

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories
    const q = query.trim().toLowerCase()
    return categories.filter((item) => item.name.toLowerCase().includes(q))
  }, [categories, query])

  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>{isCategories ? "Product Categories" : "Products Catalog"}</h1>
        <p>
          {isCategories
            ? "Search categories and see product counts at a glance."
            : "Manage the corporate health products available across plans and specialties."}
        </p>
      </header>

      {loading ? (
        <div className="ops-loader-fullscreen">
          <div className="ops-spinner" />
          <span>{isCategories ? "Loading categories..." : "Loading products..."}</span>
        </div>
      ) : null}

      {isCategories ? (
        <section className="ops-card ops-card--compact">
          <div className="ops-searchbar">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories (e.g., Diagnostics, Wellness)"
            />
            <button type="button" className="secondary">Search</button>
          </div>
          <div className="ops-category-list">
            {filteredCategories.map((item) => (
              <div key={item.name} className="ops-category-item">
                <div>
                  <div className="ops-category-name">{item.name}</div>
                  <div className="ops-kpi-sub">{item.count} products</div>
                </div>
                <span className="ops-chip">{item.count}</span>
              </div>
            ))}
            {!filteredCategories.length && (
              <div className="ops-kpi-sub">No categories match this search.</div>
            )}
          </div>
        </section>
      ) : null}

      {!isCategories ? (
      <section className="ops-actions">
        <button type="button" className="primary">Add Product</button>
        <button type="button">Create Category</button>
        <button type="button">Export Catalog</button>
      </section>
      ) : null}

      {!isCategories ? (
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
      ) : null}
    </main>
  )
}
