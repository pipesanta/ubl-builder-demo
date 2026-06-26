import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Page not found</p>
      <Link to="/" className="btn btn--primary">Go Home</Link>
    </div>
  )
}
