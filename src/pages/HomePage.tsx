import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '#',
    title: 'Invoice Builder',
    description: 'Build complete UBL 2.1 invoices interactively with real-time XML preview.',
    to: '/invoice',
  },
  {
    icon: '%',
    title: 'Credit Note',
    description: 'Create credit notes with discrepancy responses and billing references.',
    to: '/credit-note',
  },
  {
    icon: '{',
    title: 'Data Types',
    description: 'Explore UBL data types: XSD, CCT, and UDT with interactive playground.',
    to: '/data-types',
  },
  {
    icon: '<',
    title: 'Components Gallery',
    description: 'Browse CommonAggregateComponents with mini-forms and XML output.',
    to: '/components',
  },
  {
    icon: '!',
    title: 'DIAN Extensions',
    description: 'Colombian electronic invoicing: CUFE, QR codes, and DIAN-specific extensions.',
    to: '/dian',
  },
  {
    icon: '*',
    title: 'Utilities',
    description: 'SHA hashing, date formatting, and fixed-decimal math tools.',
    to: '/tools',
  },
]

export function HomePage() {
  return (
    <>
      <div className="hero">
        <p className="hero__eyebrow">ubl-builder v1.4.5</p>
        <h1>Build UBL 2.1 Documents Programmatically</h1>
        <p>
          A TypeScript library for generating valid UBL 2.1 XML documents using a fluent builder API.
          Supports Invoice, Credit Note, DIAN extensions for Colombian electronic invoicing, and more.
        </p>
        <div className="hero__actions">
          <Link to="/invoice" className="btn btn--primary">
            Try Invoice Builder
          </Link>
          <a
            href="https://www.npmjs.com/package/ubl-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            npm package
          </a>
        </div>
      </div>

      <div className="card-grid">
        {FEATURES.map((feature) => (
          <Link key={feature.to} to={feature.to} className="feature-card">
            <div className="feature-card__icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
