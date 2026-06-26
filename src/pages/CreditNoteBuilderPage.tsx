import { useState, useEffect } from 'react'
import { BillingReference, InvoiceDocumentReference } from 'ubl-builder/lib/ubl21/CommonAggregateComponents'
import { Section } from '../components/Section'
import { FormField } from '../components/FormField'
import { XmlPreview } from '../components/XmlPreview'

interface CreditNoteForm {
  id: string
  creditNoteTypeCode: string
  documentCurrencyCode: string
  issueDate: string
  issueTime: string
  notes: string[]
  discrepancyReferenceID: string
  discrepancyResponseCode: string
  discrepancyDescription: string
  billingReferenceID: string
  billingReferenceIssueDate: string
  supplierName: string
  supplierID: string
  customerName: string
  customerID: string
  lineExtensionAmount: string
  taxExclusiveAmount: string
  taxInclusiveAmount: string
  payableAmount: string
}

function getInitialState(): CreditNoteForm {
  return {
    id: '', creditNoteTypeCode: '91', documentCurrencyCode: 'COP',
    issueDate: new Date().toISOString().split('T')[0], issueTime: '14:00:00-05:00',
    notes: [], discrepancyReferenceID: '', discrepancyResponseCode: '2',
    discrepancyDescription: '', billingReferenceID: '', billingReferenceIssueDate: '',
    supplierName: '', supplierID: '', customerName: '', customerID: '',
    lineExtensionAmount: '0.00', taxExclusiveAmount: '0.00',
    taxInclusiveAmount: '0.00', payableAmount: '0.00',
  }
}

async function buildCreditNoteXml(form: CreditNoteForm): Promise<string> {
  if (!form.id) return ''

  try {
    const mod = await import('ubl-builder/lib/ubl21/schemaDocuments/CreditNote')
    const CreditNoteClass = mod.default || mod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cn: any = new CreditNoteClass()
    cn.setID(form.id)
    cn.setUBLVersionID('UBL 2.1')
    if (form.creditNoteTypeCode) cn.setCreditNoteTypeCode(form.creditNoteTypeCode)
    if (form.documentCurrencyCode) cn.setDocumentCurrencyCode(form.documentCurrencyCode)
    if (form.issueDate) cn.setIssueDate(form.issueDate)
    if (form.issueTime) cn.setIssueTime(form.issueTime)
    form.notes.forEach(n => { if (n) cn.addNote(n) })

    if (form.billingReferenceID) {
      cn.addBillingReference(new (BillingReference as any)({
        invoiceDocumentReference: new (InvoiceDocumentReference as any)({
          id: form.billingReferenceID,
          issueDate: form.billingReferenceIssueDate || form.issueDate,
        }),
      }))
    }

    return cn.getXml(true)
  } catch (err) {
    throw new Error(`CreditNote build failed: ${err instanceof Error ? err.message : err}`)
  }
}

const CN_TYPE_OPTIONS = [
  { value: '91', label: '91 - Credit Note' },
  { value: '92', label: '92 - Contingency Credit Note' },
]

const RESPONSE_CODE_OPTIONS = [
  { value: '1', label: '1 - Partial return' },
  { value: '2', label: '2 - Cancellation' },
  { value: '3', label: '3 - Discount' },
  { value: '4', label: '4 - Price adjustment' },
  { value: '5', label: '5 - Other' },
]

export function CreditNoteBuilderPage() {
  const [form, setForm] = useState<CreditNoteForm>(getInitialState)
  const [xml, setXml] = useState('')
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof CreditNoteForm, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addNote = () => setForm(prev => ({ ...prev, notes: [...prev.notes, ''] }))
  const updateNote = (i: number, v: string) => {
    setForm(prev => {
      const notes = [...prev.notes]; notes[i] = v; return { ...prev, notes }
    })
  }
  const removeNote = (i: number) => {
    setForm(prev => ({ ...prev, notes: prev.notes.filter((_, idx) => idx !== i) }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      buildCreditNoteXml(form)
        .then(result => { setXml(result); setError(null) })
        .catch(err => { setError(err instanceof Error ? err.message : String(err)); setXml('') })
    }, 300)
    return () => clearTimeout(timer)
  }, [form])

  const handleLoadExample = () => {
    setForm({
      id: 'CN-001', creditNoteTypeCode: '91', documentCurrencyCode: 'COP',
      issueDate: '2024-02-01', issueTime: '14:00:00-05:00',
      notes: ['Credit note for returned items'],
      discrepancyReferenceID: 'SETT990000001', discrepancyResponseCode: '2',
      discrepancyDescription: 'Product return',
      billingReferenceID: 'SETT990000001', billingReferenceIssueDate: '2024-01-15',
      supplierName: 'Empresa Demo S.A.S', supplierID: '900123456',
      customerName: 'Cliente Test Ltda', customerID: '860000000',
      lineExtensionAmount: '500000.00', taxExclusiveAmount: '500000.00',
      taxInclusiveAmount: '595000.00', payableAmount: '595000.00',
    })
  }

  return (
    <>
      <div className="page-header">
        <h1>Credit Note Builder</h1>
        <p>Build a UBL 2.1 Credit Note with discrepancy responses and billing references.</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--primary" onClick={handleLoadExample}>Load Example</button>
          <button className="btn" onClick={() => { setForm(getInitialState()); setXml(''); setError(null) }}>Clear</button>
        </div>
      </div>

      <div className="builder-layout">
        <div className="builder-layout__form">
          <Section title="Metadata" defaultOpen={true}>
            <div className="form-grid">
              <FormField label="Credit Note ID" value={form.id} required
                onChange={(v) => update('id', v)} placeholder="CN-001" />
              <FormField label="Type Code" value={form.creditNoteTypeCode} type="select"
                onChange={(v) => update('creditNoteTypeCode', v)} options={CN_TYPE_OPTIONS} />
              <FormField label="Currency" value={form.documentCurrencyCode} type="select"
                onChange={(v) => update('documentCurrencyCode', v)}
                options={[
                  { value: 'COP', label: 'COP' }, { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]} />
            </div>
          </Section>

          <Section title="Dates">
            <div className="form-grid">
              <FormField label="Issue Date" value={form.issueDate} type="date" required
                onChange={(v) => update('issueDate', v)} />
              <FormField label="Issue Time" value={form.issueTime}
                onChange={(v) => update('issueTime', v)} placeholder="14:00:00-05:00" />
            </div>
          </Section>

          <Section title="Notes" description={`${form.notes.length} note(s)`}>
            <div className="array-field__items">
              {form.notes.map((note, i) => (
                <div key={i} className="array-field__item">
                  <span className="array-field__item-number">{i + 1}</span>
                  <div className="array-field__item-content">
                    <FormField label={`Note ${i + 1}`} value={note}
                      onChange={(v) => updateNote(i, v)} type="textarea" />
                  </div>
                  <button className="btn btn--sm btn--danger" onClick={() => removeNote(i)}>Remove</button>
                </div>
              ))}
            </div>
            <button className="btn btn--sm array-field__add" onClick={addNote}>+ Add Note</button>
          </Section>

          <Section title="Discrepancy Response" description="Reason for the credit note">
            <div className="form-grid">
              <FormField label="Reference ID (Original Invoice)" value={form.discrepancyReferenceID} required
                onChange={(v) => update('discrepancyReferenceID', v)} placeholder="SETT990000001" />
              <FormField label="Response Code" value={form.discrepancyResponseCode} type="select"
                onChange={(v) => update('discrepancyResponseCode', v)} options={RESPONSE_CODE_OPTIONS} />
              <FormField label="Description" value={form.discrepancyDescription}
                onChange={(v) => update('discrepancyDescription', v)} placeholder="Reason for credit note" />
            </div>
          </Section>

          <Section title="Billing Reference" description="Original invoice reference">
            <div className="form-grid">
              <FormField label="Invoice Reference ID" value={form.billingReferenceID}
                onChange={(v) => update('billingReferenceID', v)} placeholder="SETT990000001" />
              <FormField label="Invoice Issue Date" value={form.billingReferenceIssueDate} type="date"
                onChange={(v) => update('billingReferenceIssueDate', v)} />
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
