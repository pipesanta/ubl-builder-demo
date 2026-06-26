import { useState, useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import { FormField } from '../components/FormField'
import { Address } from 'ubl-builder'

import {
  Party, PartyName, PartyIdentification, PostalAddress, Country,
  PartyTaxScheme, PartyLegalEntity, TaxScheme,
  TaxTotal, TaxSubtotal, TaxCategory,
  InvoiceLine, Item, Price,
  LegalMonetaryTotal,
  AllowanceCharge,
  PaymentMeans,
  PeriodType,
} from 'ubl-builder/lib/ubl21/CommonAggregateComponents'

interface ComponentDef {
  name: string
  description: string
  fields: { key: string; label: string; default: string; type?: string }[]
  build: (vals: Record<string, string>) => string
}

const COMPONENTS: ComponentDef[] = [
  {
    name: 'Party',
    description: 'An aggregate type for a party (business entity) with name, identification, address, and tax information.',
    fields: [
      { key: 'name', label: 'Party Name', default: 'Empresa Demo S.A.S' },
      { key: 'id', label: 'Company ID', default: '900123456' },
      { key: 'street', label: 'Street', default: 'Calle 100 # 45-67' },
      { key: 'city', label: 'City', default: 'Bogota' },
      { key: 'country', label: 'Country Code', default: 'CO' },
      { key: 'taxScheme', label: 'Tax Scheme', default: 'IVA' },
    ],
    build: (v) => {
      const party = new (Party as any)({
        partyNames: [new PartyName({ name: v.name })],
        partyIdentifications: [new (PartyIdentification as any)({ id: v.id })],
        postalAddress: new (PostalAddress as any)({
          id: '0', streetName: v.street, cityName: v.city,
          country: new Country({ identificationCode: v.country, name: '' }),
        }),
        partyTaxSchemes: [new (PartyTaxScheme as any)({
          registrationName: v.name, companyID: v.id,
          taxLevelCode: '0-99',
          taxScheme: new TaxScheme({ id: '01', name: v.taxScheme }),
        })],
        partyLegalEntities: [new (PartyLegalEntity as any)({
          registrationName: v.name, companyID: v.id,
        })],
      })
      return party.getAsXml(true, true)
    },
  },
  {
    name: 'TaxTotal',
    description: 'The total amount of a specific type of tax, with subtotals per tax category.',
    fields: [
      { key: 'taxAmount', label: 'Tax Amount', default: '190000.00' },
      { key: 'taxableAmount', label: 'Taxable Amount', default: '1000000.00' },
      { key: 'percent', label: 'Tax Percent', default: '19' },
      { key: 'schemeID', label: 'Tax Scheme ID', default: '01' },
      { key: 'schemeName', label: 'Tax Scheme Name', default: 'IVA' },
    ],
    build: (v) => {
      const tt = new (TaxTotal as any)({
        taxAmount: { content: v.taxAmount, attributes: { currencyID: 'COP' } },
        taxSubtotals: [new (TaxSubtotal as any)({
          taxableAmount: { content: v.taxableAmount, attributes: { currencyID: 'COP' } },
          taxAmount: { content: v.taxAmount, attributes: { currencyID: 'COP' } },
          percent: v.percent,
          taxCategory: new (TaxCategory as any)({
            percent: v.percent,
            taxScheme: new TaxScheme({ id: v.schemeID, name: v.schemeName }),
          }),
        })],
      })
      return tt.getAsXml(true, true)
    },
  },
  {
    name: 'InvoiceLine',
    description: 'A line item in an invoice, including quantity, amount, item details, and price.',
    fields: [
      { key: 'quantity', label: 'Quantity', default: '5' },
      { key: 'unitCode', label: 'Unit Code', default: 'EA' },
      { key: 'lineAmount', label: 'Line Amount', default: '500000.00' },
      { key: 'itemName', label: 'Item Name', default: 'Software License' },
      { key: 'priceAmount', label: 'Unit Price', default: '100000.00' },
    ],
    build: (v) => {
      const line = new (InvoiceLine as any)({
        id: '1',
        invoicedQuantity: { content: v.quantity, attributes: { unitCode: v.unitCode } },
        lineExtensionAmount: { content: v.lineAmount, attributes: { currencyID: 'COP' } },
        item: new (Item as any)({ description: v.itemName, name: v.itemName }),
        price: new (Price as any)({
          priceAmount: { content: v.priceAmount, attributes: { currencyID: 'COP' } },
          baseQuantity: { content: '1', attributes: { unitCode: v.unitCode } },
        }),
      })
      return line.getAsXml(true, true)
    },
  },
  {
    name: 'LegalMonetaryTotal',
    description: 'The total monetary amounts for an invoice including line totals, taxes, and payable amount.',
    fields: [
      { key: 'lineExt', label: 'Line Extension Amount', default: '2000000.00' },
      { key: 'taxExcl', label: 'Tax Exclusive Amount', default: '2000000.00' },
      { key: 'taxIncl', label: 'Tax Inclusive Amount', default: '2380000.00' },
      { key: 'payable', label: 'Payable Amount', default: '2380000.00' },
    ],
    build: (v) => {
      const total = new (LegalMonetaryTotal as any)({
        lineExtensionAmount: { content: v.lineExt, attributes: { currencyID: 'COP' } },
        taxExclusiveAmount: { content: v.taxExcl, attributes: { currencyID: 'COP' } },
        taxInclusiveAmount: { content: v.taxIncl, attributes: { currencyID: 'COP' } },
        payableAmount: { content: v.payable, attributes: { currencyID: 'COP' } },
      })
      return total.getAsXml(true, true)
    },
  },
  {
    name: 'AllowanceCharge',
    description: 'A discount or charge applied to a document or line item.',
    fields: [
      { key: 'chargeIndicator', label: 'Is Charge? (true/false)', default: 'false' },
      { key: 'reasonCode', label: 'Reason Code', default: '00' },
      { key: 'reason', label: 'Reason', default: 'Discount for early payment' },
      { key: 'amount', label: 'Amount', default: '50000.00' },
      { key: 'percent', label: 'Tax Percent', default: '19' },
    ],
    build: (v) => {
      const ac = new (AllowanceCharge as any)({
        chargeIndicator: v.chargeIndicator === 'true',
        allowanceChargeReasonCode: v.reasonCode,
        allowanceChargeReason: v.reason,
        amount: { content: v.amount, attributes: { currencyID: 'COP' } },
        taxCategory: new (TaxCategory as any)({
          percent: v.percent,
          taxScheme: new TaxScheme({ id: '01', name: 'IVA' }),
        }),
      })
      return ac.getAsXml(true, true)
    },
  },
  {
    name: 'PaymentMeans',
    description: 'Expected means of payment for the invoice.',
    fields: [
      { key: 'code', label: 'Payment Means Code', default: '10' },
      { key: 'paymentID', label: 'Payment ID', default: 'PAY-001' },
    ],
    build: (v) => {
      const pm = new (PaymentMeans as any)({
        paymentMeansCode: v.code,
        paymentID: v.paymentID,
      })
      return pm.getAsXml(true, true)
    },
  },
  {
    name: 'Period',
    description: 'A period of time, defined by start and end dates with optional descriptions.',
    fields: [
      { key: 'startDate', label: 'Start Date', default: '2024-01-01' },
      { key: 'endDate', label: 'End Date', default: '2024-12-31' },
      { key: 'description', label: 'Description', default: 'Annual billing period' },
    ],
    build: (v) => {
      const period = new PeriodType({
        startDate: v.startDate,
        endDate: v.endDate,
        description: v.description,
      })
      return period.getAsXml(true, true)
    },
  },
  {
    name: 'Address',
    description: 'A postal or physical address with street, city, region, and country details.',
    fields: [
      { key: 'street', label: 'Street', default: 'Calle 100 # 45-67' },
      { key: 'city', label: 'City', default: 'Bogota' },
      { key: 'region', label: 'Region / State', default: 'Bogota D.C.' },
      { key: 'country', label: 'Country Code', default: 'CO' },
    ],
    build: (v) => {
      const addr = new Address({
        cityName: v.city,
        countrySubentity: v.region,
        addressLines: [],
        country: new Country({ identificationCode: v.country, name: '' }),
      })
      return addr.getAsXml(true, true)
    },
  },
]

export function ComponentsPage() {
  const [selected, setSelected] = useState(COMPONENTS[0])
  const [values, setValues] = useState<Record<string, string>>({})
  const [xml, setXml] = useState('')
  const [error, setError] = useState('')
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const defaults: Record<string, string> = {}
    selected.fields.forEach(f => { defaults[f.key] = f.default })
    setValues(defaults)
  }, [selected])

  useEffect(() => {
    try {
      const result = selected.build(values)
      setXml(result)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setXml('')
    }
  }, [values, selected])

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current)
  }, [xml])

  return (
    <>
      <div className="page-header">
        <h1>Components Gallery</h1>
        <p>Browse and interact with CommonAggregateComponents (CAC). Each component has a mini-form and live XML preview.</p>
      </div>

      <div className="tabs">
        {COMPONENTS.map(c => (
          <button key={c.name}
            className={`tab ${selected.name === c.name ? 'tab--active' : ''}`}
            onClick={() => setSelected(c)}
          >{c.name}</button>
        ))}
      </div>

      <div className="builder-layout">
        <div className="builder-layout__form">
          <div className="section">
            <div className="section__body" style={{ padding: '1.25rem' }}>
              <h3 style={{ marginBottom: '0.25rem' }}>{selected.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                {selected.description}
              </p>
              <div className="form-grid">
                {selected.fields.map(field => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    value={values[field.key] || ''}
                    onChange={(v) => setValues(prev => ({ ...prev, [field.key]: v }))}
                    type={field.type as 'text' || 'text'}
                    placeholder={field.default}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="builder-layout__preview">
          <div className="xml-preview">
            <div className="xml-preview__header">
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>XML Output</span>
              <span className="badge">{selected.name}</span>
            </div>
            {error ? (
              <div className="xml-preview__error">{error}</div>
            ) : (
              <div className="xml-preview__body">
                <pre><code ref={codeRef} className="language-markup">{xml}</code></pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
