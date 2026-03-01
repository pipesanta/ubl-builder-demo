import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="page hero">
      <p className="eyebrow">UBL Builder Demo</p>
      <h1>Build UBL documents in a simple way</h1>
      <p className="hero-copy">
        Explore the package integration and review available exports in a dedicated showcase page.
      </p>
      <div className="hero-actions">
        <Link className="btn-primary" to="/showcase">
          Ir al Showcase
        </Link>
      </div>
    </main>
  )
}
