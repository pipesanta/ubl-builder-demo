import { useState, useCallback, useEffect } from 'react'
import { Invoice } from 'ubl-builder'
import {
  AccountingSupplierParty, AccountingCustomerParty,
  Party, PartyName, PartyIdentification, PostalAddress, Country,
  PartyTaxScheme, PartyLegalEntity, TaxScheme, Contact,
  TaxTotal, TaxSubtotal, TaxCategory,
  InvoiceLine, Item, Price,
  LegalMonetaryTotal,
} from 'ubl-builder/lib/ubl21/CommonAggregateComponents'
import { Section } from '../components/Section'
import { FormField } from '../components/FormField'
import { XmlPreview } from '../components/XmlPreview'
import { INVOICE_EXAMPLE } from '../examples/invoiceExample'

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
]

const INVOICE_TYPE_OPTIONS = [
  { value: '01', label: '01 - Standard Invoice' },
  { value: '02', label: '02 - Export Invoice' },
  { value: '03', label: '03 - Contingency Invoice' },
  { value: '04', label: '04 - Simplified Invoice' },
]

interface PartyForm {
  partyName: string
  companyID: string
  companySchemeID: string
  companySchemeName: string
  registrationName: string
  taxSchemeID: string
  taxSchemeName: string
  streetName: string
  cityName: string
  countrySubentity: string
  countrySubentityCode: string
  countryCode: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

interface LineForm {
  invoicedQuantity: string
  unitCode: string
  lineExtensionAmount: string
  itemName: string
  itemDescription: string
  priceAmount: string
  taxAmount: string
  taxableAmount: string
  taxPercent: string
  taxSchemeID: string
  taxSchemeName: string
}

interface TaxTotalForm {
  taxAmount: string
  taxableAmount: string
  percent: string
  taxSchemeID: string
  taxSchemeName: string
}

interface InvoiceForm {
  id: string
  environment: string
  ublVersionID: string
  customizationID: string
  profileID: string
  profileExecutionID: string
  invoiceTypeCode: string
  documentCurrencyCode: string
  issueDate: string
  issueTime: string
  dueDate: string
  notes: string[]
  supplier: PartyForm
  customer: PartyForm
  lines: LineForm[]
  taxTotals: TaxTotalForm[]
  lineExtensionAmount: string
  taxExclusiveAmount: string
  taxInclusiveAmount: string
  payableAmount: string
}

const EMPTY_PARTY: PartyForm = {
  partyName: '', companyID: '', companySchemeID: '', companySchemeName: '31',
  registrationName: '', taxSchemeID: '01', taxSchemeName: 'IVA',
  streetName: '', cityName: '', countrySubentity: '', countrySubentityCode: '',
  countryCode: 'CO', contactName: '', contactPhone: '', contactEmail: '',
}

const EMPTY_LINE: LineForm = {
  invoicedQuantity: '1', unitCode: 'EA', lineExtensionAmount: '0.00',
  itemName: '', itemDescription: '', priceAmount: '0.00',
  taxAmount: '0.00', taxableAmount: '0.00', taxPercent: '19',
  taxSchemeID: '01', taxSchemeName: 'IVA',
}

const EMPTY_TAX: TaxTotalForm = {
  taxAmount: '0.00', taxableAmount: '0.00', percent: '19',
  taxSchemeID: '01', taxSchemeName: 'IVA',
}

function getInitialState(): InvoiceForm {
  return {
    id: '', environment: '2', ublVersionID: 'UBL 2.1',
    customizationID: '10', profileID: 'DIAN 2.1', profileExecutionID: '2',
    invoiceTypeCode: '01', documentCurrencyCode: 'COP',
    issueDate: new Date().toISOString().split('T')[0],
    issueTime: '10:00:00-05:00', dueDate: '', notes: [],
    supplier: { ...EMPTY_PARTY }, customer: { ...EMPTY_PARTY },
    lines: [], taxTotals: [],
    lineExtensionAmount: '0.00', taxExclusiveAmount: '0.00',
    taxInclusiveAmount: '0.00', payableAmount: '0.00',
  }
}

function loadExample(): InvoiceForm {
  const ex = INVOICE_EXAMPLE
  return {
    id: ex.id, environment: ex.environment, ublVersionID: ex.ublVersionID,
    customizationID: ex.customizationID, profileID: ex.profileID,
    profileExecutionID: ex.profileExecutionID, invoiceTypeCode: ex.invoiceTypeCode,
    documentCurrencyCode: ex.documentCurrencyCode,
    issueDate: ex.issueDate, issueTime: ex.issueTime, dueDate: ex.dueDate,
    notes: [...ex.notes],
    supplier: { ...ex.supplier },
    customer: { ...ex.customer },
    lines: ex.lines.map(l => ({ ...l })),
    taxTotals: ex.taxTotals.map(t => ({ ...t })),
    lineExtensionAmount: ex.legalMonetaryTotal.lineExtensionAmount,
    taxExclusiveAmount: ex.legalMonetaryTotal.taxExclusiveAmount,
    taxInclusiveAmount: ex.legalMonetaryTotal.taxInclusiveAmount,
    payableAmount: ex.legalMonetaryTotal.payableAmount,
  }
}

function buildInvoiceXml(form: InvoiceForm): string {
  if (!form.id) return ''

  const inv = new Invoice(form.id, {
    enviroment: form.environment,
    issuer: {
      resolutionNumber: '18760000001',
      technicalKey: 'fc8eac422eba16e22ffd8c6f94b3f40a6e38162c',
      prefix: 'SETT', startRange: '990000000', endRange: '995000000',
      startDate: '2019-01-19', endDate: '2030-01-19',
    },
    software: {
      id: '56cd4254-a06e-4db1-87ec-a3561f9d0598',
      pin: '12345', providerNit: '900373115',
    },
  })

  inv.setDefaultProperties()
  inv.setUBLVersionID(form.ublVersionID)
  if (form.customizationID) inv.setCustomizationID(form.customizationID)
  if (form.profileID) inv.setProfileID(form.profileID)
  if (form.profileExecutionID) inv.setProfileExecutionID(form.profileExecutionID)
  inv.setID(form.id)
  inv.setInvoiceTypeCode(form.invoiceTypeCode)
  inv.setDocumentCurrencyCode(form.documentCurrencyCode)
  if (form.issueDate) inv.setIssueDate(form.issueDate)
  if (form.issueTime) inv.setIssueTime(form.issueTime)
  if (form.dueDate) inv.setDueDate(form.dueDate)
  form.notes.forEach(n => { if (n) inv.addNote(n) })

  if (form.supplier.companyID && form.supplier.partyName) {
    const buildParty = (p: PartyForm) => new (Party as any)({
      partyNames: [new PartyName({ name: p.partyName })],
      partyIdentifications: [new (PartyIdentification as any)({ id: { content: p.companyID, attributes: { schemeID: p.companySchemeID, schemeName: p.companySchemeName } } })],
      postalAddress: new (PostalAddress as any)({
        id: '0',
        streetName: p.streetName || 'N/A',
        cityName: p.cityName || 'N/A',
        countrySubentity: p.countrySubentity || '',
        countrySubentityCode: p.countrySubentityCode || '',
        country: new Country({ identificationCode: p.countryCode || 'CO', name: '' }),
      }),
      partyTaxSchemes: [new (PartyTaxScheme as any)({
        registrationName: p.registrationName,
        companyID: { content: p.companyID, attributes: { schemeID: p.companySchemeID, schemeName: p.companySchemeName, schemeAgencyID: '195', schemeAgencyName: 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)' } },
        taxLevelCode: '0-99',
        taxScheme: new TaxScheme({ id: p.taxSchemeID, name: p.taxSchemeName }),
      })],
      partyLegalEntities: [new (PartyLegalEntity as any)({
        registrationName: p.registrationName || p.partyName,
        companyID: { content: p.companyID, attributes: { schemeID: p.companySchemeID, schemeName: p.companySchemeName, schemeAgencyID: '195', schemeAgencyName: 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)' } },
      })],
      contact: p.contactName ? new Contact({ name: p.contactName, telephone: p.contactPhone, electronicMail: p.contactEmail }) : undefined,
    })

    inv.setAccountingSupplierParty(new (AccountingSupplierParty as any)({
      party: buildParty(form.supplier),
    }))

    inv.setAccountingCustomerParty(new (AccountingCustomerParty as any)({
      party: buildParty(form.customer),
    }))
  }

  const cc = form.documentCurrencyCode

  if (form.lines.length > 0) {
    form.lines.forEach((line) => {
      inv.addInvoiceLine(new (InvoiceLine as any)({
        id: '0',
        invoicedQuantity: { content: line.invoicedQuantity, attributes: { unitCode: line.unitCode } },
        lineExtensionAmount: { content: line.lineExtensionAmount, attributes: { currencyID: cc } },
        taxTotals: [new (TaxTotal as any)({
          taxAmount: { content: line.taxAmount, attributes: { currencyID: cc } },
          taxSubtotals: [new (TaxSubtotal as any)({
            taxableAmount: { content: line.taxableAmount, attributes: { currencyID: cc } },
            taxAmount: { content: line.taxAmount, attributes: { currencyID: cc } },
            percent: line.taxPercent,
            taxCategory: new (TaxCategory as any)({
              percent: line.taxPercent,
              taxScheme: new TaxScheme({ id: line.taxSchemeID, name: line.taxSchemeName }),
            }),
          })],
        })],
        item: new (Item as any)({ description: line.itemDescription || line.itemName, name: line.itemName }),
        price: new (Price as any)({
          priceAmount: { content: line.priceAmount, attributes: { currencyID: cc } },
          baseQuantity: { content: '1', attributes: { unitCode: line.unitCode } },
        }),
      }))
    })
  }

  if (form.taxTotals.length > 0) {
    form.taxTotals.forEach((tt) => {
      inv.addTaxTotal(new (TaxTotal as any)({
        taxAmount: { content: tt.taxAmount, attributes: { currencyID: cc } },
        taxSubtotals: [new (TaxSubtotal as any)({
          taxableAmount: { content: tt.taxableAmount, attributes: { currencyID: cc } },
          taxAmount: { content: tt.taxAmount, attributes: { currencyID: cc } },
          percent: tt.percent,
          taxCategory: new (TaxCategory as any)({
            percent: tt.percent,
            taxScheme: new TaxScheme({ id: tt.taxSchemeID, name: tt.taxSchemeName }),
          }),
        })],
      }))
    })
  }

  if (form.payableAmount && form.payableAmount !== '0.00') {
    inv.setLegalMonetaryTotal(new (LegalMonetaryTotal as any)({
      lineExtensionAmount: { content: form.lineExtensionAmount, attributes: { currencyID: cc } },
      taxExclusiveAmount: { content: form.taxExclusiveAmount, attributes: { currencyID: cc } },
      taxInclusiveAmount: { content: form.taxInclusiveAmount, attributes: { currencyID: cc } },
      payableAmount: { content: form.payableAmount, attributes: { currencyID: cc } },
    }))
  }

  return inv.getXml(true)
}

function PartySection({ title, party, onChange }: {
  title: string
  party: PartyForm
  onChange: (field: keyof PartyForm, value: string) => void
}) {
  return (
    <Section title={title} defaultOpen={false}>
      <div className="form-group">
        <div className="form-group__title">Identification</div>
        <div className="form-grid">
          <FormField label="Party Name" value={party.partyName} required
            onChange={(v) => onChange('partyName', v)} placeholder="Company name" />
          <FormField label="Company ID (NIT/ID)" value={party.companyID} required
            onChange={(v) => onChange('companyID', v)} placeholder="900123456" />
          <FormField label="Scheme ID" value={party.companySchemeID}
            onChange={(v) => onChange('companySchemeID', v)} placeholder="9" />
          <FormField label="Registration Name" value={party.registrationName}
            onChange={(v) => onChange('registrationName', v)} placeholder="Legal name" />
        </div>
      </div>
      <div className="form-group">
        <div className="form-group__title">Address</div>
        <div className="form-grid">
          <FormField label="Street" value={party.streetName}
            onChange={(v) => onChange('streetName', v)} placeholder="Calle 100 # 45-67" />
          <FormField label="City" value={party.cityName}
            onChange={(v) => onChange('cityName', v)} placeholder="Bogota" />
          <FormField label="State / Region" value={party.countrySubentity}
            onChange={(v) => onChange('countrySubentity', v)} placeholder="Bogota D.C." />
          <FormField label="Country Code" value={party.countryCode}
            onChange={(v) => onChange('countryCode', v)} placeholder="CO" />
        </div>
      </div>
      <div className="form-group">
        <div className="form-group__title">Tax Scheme</div>
        <div className="form-grid">
          <FormField label="Tax Scheme ID" value={party.taxSchemeID}
            onChange={(v) => onChange('taxSchemeID', v)} placeholder="01" />
          <FormField label="Tax Scheme Name" value={party.taxSchemeName}
            onChange={(v) => onChange('taxSchemeName', v)} placeholder="IVA" />
        </div>
      </div>
      <div className="form-group">
        <div className="form-group__title">Contact</div>
        <div className="form-grid">
          <FormField label="Name" value={party.contactName}
            onChange={(v) => onChange('contactName', v)} placeholder="Juan Perez" />
          <FormField label="Phone" value={party.contactPhone}
            onChange={(v) => onChange('contactPhone', v)} placeholder="3001234567" />
          <FormField label="Email" value={party.contactEmail}
            onChange={(v) => onChange('contactEmail', v)} placeholder="email@company.com" />
        </div>
      </div>
    </Section>
  )
}

export function InvoiceBuilderPage() {
  const [form, setForm] = useState<InvoiceForm>(getInitialState)
  const [xml, setXml] = useState('')
  const [error, setError] = useState<string | null>(null)

  const updateField = useCallback((field: keyof InvoiceForm, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateSupplier = useCallback((field: keyof PartyForm, value: string) => {
    setForm(prev => ({ ...prev, supplier: { ...prev.supplier, [field]: value } }))
  }, [])

  const updateCustomer = useCallback((field: keyof PartyForm, value: string) => {
    setForm(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }))
  }, [])

  const addNote = useCallback(() => {
    setForm(prev => ({ ...prev, notes: [...prev.notes, ''] }))
  }, [])

  const updateNote = useCallback((index: number, value: string) => {
    setForm(prev => {
      const notes = [...prev.notes]
      notes[index] = value
      return { ...prev, notes }
    })
  }, [])

  const removeNote = useCallback((index: number) => {
    setForm(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }))
  }, [])

  const addLine = useCallback(() => {
    setForm(prev => ({ ...prev, lines: [...prev.lines, { ...EMPTY_LINE }] }))
  }, [])

  const updateLine = useCallback((index: number, field: keyof LineForm, value: string) => {
    setForm(prev => {
      const lines = prev.lines.map((l, i) => i === index ? { ...l, [field]: value } : l)
      return { ...prev, lines }
    })
  }, [])

  const removeLine = useCallback((index: number) => {
    setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }))
  }, [])

  const addTaxTotal = useCallback(() => {
    setForm(prev => ({ ...prev, taxTotals: [...prev.taxTotals, { ...EMPTY_TAX }] }))
  }, [])

  const updateTaxTotal = useCallback((index: number, field: keyof TaxTotalForm, value: string) => {
    setForm(prev => {
      const taxTotals = prev.taxTotals.map((t, i) => i === index ? { ...t, [field]: value } : t)
      return { ...prev, taxTotals }
    })
  }, [])

  const removeTaxTotal = useCallback((index: number) => {
    setForm(prev => ({ ...prev, taxTotals: prev.taxTotals.filter((_, i) => i !== index) }))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const result = buildInvoiceXml(form)
        setXml(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setXml('')
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [form])

  const handleLoadExample = () => setForm(loadExample())
  const handleClear = () => { setForm(getInitialState()); setXml(''); setError(null) }

  return (
    <>
      <div className="page-header">
        <h1>Invoice Builder</h1>
        <p>Build a UBL 2.1 Invoice interactively. Fill in the sections below and see the XML generated in real-time.</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--primary" onClick={handleLoadExample}>Load Example</button>
          <button className="btn" onClick={handleClear}>Clear</button>
        </div>
      </div>

      <div className="builder-layout">
        <div className="builder-layout__form">
          {/* Metadata */}
          <Section title="Metadata" description="Basic invoice identification" defaultOpen={true}>
            <div className="form-grid">
              <FormField label="Invoice ID" value={form.id} required
                onChange={(v) => updateField('id', v)} placeholder="SETT990000001" />
              <FormField label="Environment" value={form.environment}
                onChange={(v) => updateField('environment', v)} type="select"
                options={[{ value: '1', label: '1 - Production' }, { value: '2', label: '2 - Testing' }]} />
              <FormField label="UBL Version" value={form.ublVersionID}
                onChange={(v) => updateField('ublVersionID', v)} placeholder="UBL 2.1" />
              <FormField label="Customization ID" value={form.customizationID}
                onChange={(v) => updateField('customizationID', v)} placeholder="10" />
              <FormField label="Profile ID" value={form.profileID}
                onChange={(v) => updateField('profileID', v)} placeholder="DIAN 2.1" />
              <FormField label="Profile Execution ID" value={form.profileExecutionID}
                onChange={(v) => updateField('profileExecutionID', v)} placeholder="2" />
            </div>
          </Section>

          {/* Codes */}
          <Section title="Document Codes" description="Type and currency codes">
            <div className="form-grid">
              <FormField label="Invoice Type Code" value={form.invoiceTypeCode} type="select"
                onChange={(v) => updateField('invoiceTypeCode', v)} options={INVOICE_TYPE_OPTIONS} />
              <FormField label="Document Currency" value={form.documentCurrencyCode} type="select"
                onChange={(v) => updateField('documentCurrencyCode', v)} options={CURRENCY_OPTIONS} />
            </div>
          </Section>

          {/* Dates */}
          <Section title="Dates" description="Issue, due, and tax dates">
            <div className="form-grid">
              <FormField label="Issue Date" value={form.issueDate} type="date" required
                onChange={(v) => updateField('issueDate', v)} />
              <FormField label="Issue Time" value={form.issueTime}
                onChange={(v) => updateField('issueTime', v)} placeholder="10:00:00-05:00" />
              <FormField label="Due Date" value={form.dueDate} type="date"
                onChange={(v) => updateField('dueDate', v)} />
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes" description={`${form.notes.length} note(s)`}>
            <div className="array-field__items">
              {form.notes.map((note, i) => (
                <div key={i} className="array-field__item">
                  <span className="array-field__item-number">{i + 1}</span>
                  <div className="array-field__item-content">
                    <FormField label={`Note ${i + 1}`} value={note}
                      onChange={(v) => updateNote(i, v)} type="textarea" placeholder="Enter note text..." />
                  </div>
                  <button className="btn btn--sm btn--danger" onClick={() => removeNote(i)}>Remove</button>
                </div>
              ))}
            </div>
            <button className="btn btn--sm array-field__add" onClick={addNote}>+ Add Note</button>
          </Section>

          {/* Parties */}
          <PartySection title="Supplier Party" party={form.supplier} onChange={updateSupplier} />
          <PartySection title="Customer Party" party={form.customer} onChange={updateCustomer} />

          {/* Invoice Lines */}
          <Section title="Invoice Lines" description={`${form.lines.length} line(s)`}>
            <div className="array-field__items">
              {form.lines.map((line, i) => (
                <div key={i} className="array-field__item">
                  <span className="array-field__item-number">{i + 1}</span>
                  <div className="array-field__item-content">
                    <div className="form-grid">
                      <FormField label="Item Name" value={line.itemName} required
                        onChange={(v) => updateLine(i, 'itemName', v)} placeholder="Product name" />
                      <FormField label="Description" value={line.itemDescription}
                        onChange={(v) => updateLine(i, 'itemDescription', v)} placeholder="Item description" />
                      <FormField label="Quantity" value={line.invoicedQuantity} type="number"
                        onChange={(v) => updateLine(i, 'invoicedQuantity', v)} />
                      <FormField label="Unit Code" value={line.unitCode}
                        onChange={(v) => updateLine(i, 'unitCode', v)} placeholder="EA" />
                      <FormField label="Unit Price" value={line.priceAmount} type="number"
                        onChange={(v) => updateLine(i, 'priceAmount', v)} />
                      <FormField label="Line Amount" value={line.lineExtensionAmount} type="number"
                        onChange={(v) => updateLine(i, 'lineExtensionAmount', v)} />
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <div className="form-group__title">Line Tax</div>
                      <div className="form-grid">
                        <FormField label="Tax Amount" value={line.taxAmount} type="number"
                          onChange={(v) => updateLine(i, 'taxAmount', v)} />
                        <FormField label="Taxable Amount" value={line.taxableAmount} type="number"
                          onChange={(v) => updateLine(i, 'taxableAmount', v)} />
                        <FormField label="Tax %" value={line.taxPercent} type="number"
                          onChange={(v) => updateLine(i, 'taxPercent', v)} />
                        <FormField label="Tax Scheme" value={line.taxSchemeName}
                          onChange={(v) => updateLine(i, 'taxSchemeName', v)} placeholder="IVA" />
                      </div>
                    </div>
                  </div>
                  <button className="btn btn--sm btn--danger" onClick={() => removeLine(i)}>Remove</button>
                </div>
              ))}
            </div>
            <button className="btn btn--sm array-field__add" onClick={addLine}>+ Add Invoice Line</button>
          </Section>

          {/* Tax Totals */}
          <Section title="Tax Totals" description={`${form.taxTotals.length} total(s)`}>
            <div className="array-field__items">
              {form.taxTotals.map((tt, i) => (
                <div key={i} className="array-field__item">
                  <span className="array-field__item-number">{i + 1}</span>
                  <div className="array-field__item-content">
                    <div className="form-grid">
                      <FormField label="Tax Amount" value={tt.taxAmount} type="number"
                        onChange={(v) => updateTaxTotal(i, 'taxAmount', v)} />
                      <FormField label="Taxable Amount" value={tt.taxableAmount} type="number"
                        onChange={(v) => updateTaxTotal(i, 'taxableAmount', v)} />
                      <FormField label="Percent" value={tt.percent} type="number"
                        onChange={(v) => updateTaxTotal(i, 'percent', v)} />
                      <FormField label="Tax Scheme ID" value={tt.taxSchemeID}
                        onChange={(v) => updateTaxTotal(i, 'taxSchemeID', v)} />
                      <FormField label="Tax Scheme Name" value={tt.taxSchemeName}
                        onChange={(v) => updateTaxTotal(i, 'taxSchemeName', v)} />
                    </div>
                  </div>
                  <button className="btn btn--sm btn--danger" onClick={() => removeTaxTotal(i)}>Remove</button>
                </div>
              ))}
            </div>
            <button className="btn btn--sm array-field__add" onClick={addTaxTotal}>+ Add Tax Total</button>
          </Section>

          {/* Legal Monetary Total */}
          <Section title="Legal Monetary Total" description="Final amounts">
            <div className="form-grid">
              <FormField label="Line Extension Amount" value={form.lineExtensionAmount} type="number" required
                onChange={(v) => updateField('lineExtensionAmount', v)} />
              <FormField label="Tax Exclusive Amount" value={form.taxExclusiveAmount} type="number" required
                onChange={(v) => updateField('taxExclusiveAmount', v)} />
              <FormField label="Tax Inclusive Amount" value={form.taxInclusiveAmount} type="number" required
                onChange={(v) => updateField('taxInclusiveAmount', v)} />
              <FormField label="Payable Amount" value={form.payableAmount} type="number" required
                onChange={(v) => updateField('payableAmount', v)} />
            </div>
          </Section>
        </div>

        <div className="builder-layout__preview">
          <XmlPreview xml={xml} error={error} />
        </div>
      </div>
    </>
  )
}
