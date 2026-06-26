import { useState, useEffect, useRef } from 'react'
import { Invoice } from 'ubl-builder'
import { Section } from '../components/Section'
import { FormField } from '../components/FormField'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import { INVOICE_EXAMPLE } from '../examples/invoiceExample'

interface DianForm {
  resolutionNumber: string
  technicalKey: string
  prefix: string
  startRange: string
  endRange: string
  startDate: string
  endDate: string
  softwareID: string
  softwarePin: string
  providerNit: string
  invoiceID: string
  environment: string
}

function getInitialState(): DianForm {
  const d = INVOICE_EXAMPLE.dian
  return {
    resolutionNumber: d.resolutionNumber,
    technicalKey: d.technicalKey,
    prefix: d.prefix,
    startRange: d.startRange,
    endRange: d.endRange,
    startDate: d.startDate,
    endDate: d.endDate,
    softwareID: d.softwareID,
    softwarePin: d.softwarePin,
    providerNit: d.providerNit,
    invoiceID: 'SETT990000001',
    environment: '2',
  }
}

function buildDianExtensionXml(form: DianForm): string {
  if (!form.invoiceID || !form.resolutionNumber) return ''

  const inv = new Invoice(form.invoiceID, {
    enviroment: form.environment,
    issuer: {
      resolutionNumber: form.resolutionNumber,
      technicalKey: form.technicalKey,
      prefix: form.prefix,
      startRange: form.startRange,
      endRange: form.endRange,
      startDate: form.startDate,
      endDate: form.endDate,
    },
    software: {
      id: form.softwareID,
      pin: form.softwarePin,
      providerNit: form.providerNit,
    },
  })

  inv.setID(form.invoiceID)
  inv.calculateDianExtension()

  const xml = inv.getXml(true, true)

  const extStart = xml.indexOf('<ext:UBLExtensions')
  const extEnd = xml.indexOf('</ext:UBLExtensions>') + '</ext:UBLExtensions>'.length

  if (extStart >= 0 && extEnd > extStart) {
    return xml.substring(extStart, extEnd)
  }

  return xml
}

export function DianExtensionPage() {
  const [form, setForm] = useState<DianForm>(getInitialState)
  const [xml, setXml] = useState('')
  const [error, setError] = useState<string | null>(null)
  const codeRef = useRef<HTMLElement>(null)

  const update = (field: keyof DianForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const result = buildDianExtensionXml(form)
        setXml(result); setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err)); setXml('')
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [form])

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current)
  }, [xml])

  return (
    <>
      <div className="page-header">
        <h1>DIAN Extensions</h1>
        <p>
          Colombian electronic invoicing extensions for DIAN (Direccion de Impuestos y Aduanas Nacionales).
          Configure issuer and software parameters to generate the UBL Extension XML.
        </p>
      </div>

      <div className="builder-layout">
        <div className="builder-layout__form">
          <Section title="Invoice" defaultOpen={true}>
            <div className="form-grid">
              <FormField label="Invoice ID" value={form.invoiceID} required
                onChange={(v) => update('invoiceID', v)} placeholder="SETT990000001" />
              <FormField label="Environment" value={form.environment} type="select"
                onChange={(v) => update('environment', v)}
                options={[{ value: '1', label: '1 - Production' }, { value: '2', label: '2 - Testing' }]} />
            </div>
          </Section>

          <Section title="Issuer Configuration" description="DIAN authorization details" defaultOpen={true}>
            <div className="form-grid">
              <FormField label="Resolution Number" value={form.resolutionNumber} required
                onChange={(v) => update('resolutionNumber', v)} placeholder="18760000001" />
              <FormField label="Technical Key" value={form.technicalKey} required
                onChange={(v) => update('technicalKey', v)} placeholder="fc8eac422eba..." />
              <FormField label="Prefix" value={form.prefix} required
                onChange={(v) => update('prefix', v)} placeholder="SETT" />
              <FormField label="Start Range" value={form.startRange}
                onChange={(v) => update('startRange', v)} placeholder="990000000" />
              <FormField label="End Range" value={form.endRange}
                onChange={(v) => update('endRange', v)} placeholder="995000000" />
              <FormField label="Authorization Start Date" value={form.startDate} type="date"
                onChange={(v) => update('startDate', v)} />
              <FormField label="Authorization End Date" value={form.endDate} type="date"
                onChange={(v) => update('endDate', v)} />
            </div>
          </Section>

          <Section title="Software Configuration" description="Technology provider" defaultOpen={true}>
            <div className="form-grid">
              <FormField label="Software ID" value={form.softwareID} required
                onChange={(v) => update('softwareID', v)} placeholder="56cd4254-a06e..." />
              <FormField label="Software PIN" value={form.softwarePin} required
                onChange={(v) => update('softwarePin', v)} placeholder="12345" />
              <FormField label="Provider NIT" value={form.providerNit} required
                onChange={(v) => update('providerNit', v)} placeholder="900373115" />
            </div>
          </Section>

          {/* Explanation */}
          <div className="tool-section">
            <h3>How DIAN Extensions Work</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              The DIAN extension contains:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li><strong>InvoiceControl</strong> - Authorization resolution, period, and authorized invoice range</li>
              <li><strong>InvoiceSource</strong> - Country identification code (CO for Colombia)</li>
              <li><strong>SoftwareProvider</strong> - Technology provider NIT and software ID</li>
              <li><strong>SoftwareSecurityCode</strong> - SHA384 hash of (softwareID + PIN + invoiceID)</li>
              <li><strong>AuthorizationProvider</strong> - DIAN's NIT (800197268)</li>
            </ul>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginTop: '0.75rem' }}>
              The <strong>CUFE</strong> (Codigo Unico de Facturacion Electronica) is a SHA384 hash computed from
              invoice metadata, tax amounts, parties, and the technical key. It uniquely identifies each invoice.
            </p>
          </div>
        </div>

        <div className="builder-layout__preview">
          <div className="xml-preview">
            <div className="xml-preview__header">
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>DIAN Extension XML</span>
              <span className="badge">ext:UBLExtensions</span>
            </div>
            {error ? (
              <div className="xml-preview__error">{error}</div>
            ) : xml ? (
              <div className="xml-preview__body">
                <pre><code ref={codeRef} className="language-markup">{xml}</code></pre>
              </div>
            ) : (
              <div className="xml-preview__empty">
                Fill in the configuration to generate the DIAN extension
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
