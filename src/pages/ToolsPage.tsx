import { useState } from 'react'
import { Section } from '../components/Section'
import { FormField } from '../components/FormField'

async function computeHash(algorithm: string, text: string, encoding: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const algoMap: Record<string, string> = {
    'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512', 'SHA-1': 'SHA-1',
  }
  const hashBuffer = await crypto.subtle.digest(algoMap[algorithm] || 'SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)

  if (encoding === 'hex') {
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  if (encoding === 'base64') {
    return btoa(String.fromCharCode(...hashArray))
  }
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
}

function decomposeDate(timestamp: number, timezone: string) {
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    weekday: 'long', hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value || ''

  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)

  return {
    year: get('year'),
    month: get('month'),
    dayOfMonth: get('day'),
    weekday: get('weekday'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
    dayOfYear: String(dayOfYear),
    timestamp: String(timestamp),
    iso: date.toISOString(),
  }
}

function fixDecimals(value: string, decimals: number): string {
  const num = parseFloat(value)
  if (isNaN(num)) return 'Invalid number'
  return num.toFixed(decimals)
}

function addition(items: string[], digits: number): string {
  const sum = items.reduce((acc, item) => {
    const n = parseFloat(item)
    return acc + (isNaN(n) ? 0 : n)
  }, 0)
  return sum.toFixed(digits)
}

export function ToolsPage() {
  // SHA state
  const [shaInput, setShaInput] = useState('Hello UBL Builder!')
  const [shaAlgo, setShaAlgo] = useState('SHA-384')
  const [shaEncoding, setShaEncoding] = useState('hex')
  const [shaResult, setShaResult] = useState('')

  const handleHash = async () => {
    const result = await computeHash(shaAlgo, shaInput, shaEncoding)
    setShaResult(result)
  }

  // Date state
  const [dateTimestamp, setDateTimestamp] = useState(String(Date.now()))
  const [dateTimezone, setDateTimezone] = useState('America/Bogota')
  const [dateResult, setDateResult] = useState<Record<string, string> | null>(null)

  const handleDecompose = () => {
    const ts = parseInt(dateTimestamp)
    if (isNaN(ts)) return
    setDateResult(decomposeDate(ts, dateTimezone))
  }

  // Math state
  const [fixValue, setFixValue] = useState('123.456789')
  const [fixDecimals2, setFixDecimals2] = useState('2')
  const [addItems, setAddItems] = useState('100.50, 200.75, 50.25')
  const [addDigits, setAddDigits] = useState('2')

  return (
    <>
      <div className="page-header">
        <h1>Utilities</h1>
        <p>Interactive demos of the utility functions included in ubl-builder: SHA hashing, date formatting, and decimal math.</p>
      </div>

      {/* SHA Hashing */}
      <Section title="SHA Hashing" description="Cryptographic hash functions" defaultOpen={true}>
        <div className="form-grid">
          <FormField label="Input Text" value={shaInput}
            onChange={setShaInput} type="textarea" placeholder="Text to hash..." />
          <FormField label="Algorithm" value={shaAlgo} type="select"
            onChange={setShaAlgo}
            options={[
              { value: 'SHA-256', label: 'SHA-256' },
              { value: 'SHA-384', label: 'SHA-384' },
              { value: 'SHA-512', label: 'SHA-512' },
              { value: 'SHA-1', label: 'SHA-1' },
            ]} />
          <FormField label="Output Encoding" value={shaEncoding} type="select"
            onChange={setShaEncoding}
            options={[
              { value: 'hex', label: 'Hexadecimal' },
              { value: 'base64', label: 'Base64' },
            ]} />
        </div>
        <button className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={handleHash}>
          Compute Hash
        </button>
        {shaResult && (
          <div className="tool-result" style={{ marginTop: '1rem' }}>
            <div className="tool-result__label">Hash Result ({shaAlgo})</div>
            {shaResult}
          </div>
        )}
        <div className="tool-result" style={{ marginTop: '0.75rem' }}>
          <div className="tool-result__label">Library equivalent</div>
          <pre style={{ margin: 0, fontSize: '0.8rem' }}>{`import { SHA384 } from 'ubl-builder/lib/tools/shas'\n\nconst hash = new ${shaAlgo.replace('-', '')}()\n  .getHash('${shaInput}', 'binary', '${shaEncoding}')`}</pre>
        </div>
      </Section>

      {/* Date Formatter */}
      <Section title="Date Formatter" description="Decompose timestamps into components" defaultOpen={true}>
        <div className="form-grid">
          <FormField label="Timestamp (ms)" value={dateTimestamp}
            onChange={setDateTimestamp} placeholder={String(Date.now())} />
          <FormField label="Timezone" value={dateTimezone} type="select"
            onChange={setDateTimezone}
            options={[
              { value: 'America/Bogota', label: 'America/Bogota (UTC-5)' },
              { value: 'America/New_York', label: 'America/New_York (UTC-5/-4)' },
              { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
              { value: 'Europe/Madrid', label: 'Europe/Madrid (UTC+1/+2)' },
              { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
              { value: 'UTC', label: 'UTC' },
            ]} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn--primary" onClick={handleDecompose}>Decompose</button>
          <button className="btn" onClick={() => { setDateTimestamp(String(Date.now())); setDateResult(null) }}>
            Use Now
          </button>
        </div>
        {dateResult && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
            {Object.entries(dateResult).map(([key, val]) => (
              <div key={key} className="tool-result" style={{ margin: 0, padding: '0.6rem' }}>
                <div className="tool-result__label">{key}</div>
                {val}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Math Tools */}
      <Section title="Math Tools" description="Fixed-decimal arithmetic" defaultOpen={true}>
        <div className="form-group">
          <div className="form-group__title">fixDecimals</div>
          <div className="form-grid">
            <FormField label="Value" value={fixValue}
              onChange={setFixValue} placeholder="123.456789" />
            <FormField label="Decimal Places" value={fixDecimals2}
              onChange={setFixDecimals2} type="number" placeholder="2" />
          </div>
          <div className="tool-result" style={{ marginTop: '0.75rem' }}>
            <div className="tool-result__label">Result</div>
            {fixDecimals(fixValue, parseInt(fixDecimals2) || 2)}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <div className="form-group__title">addition</div>
          <div className="form-grid">
            <FormField label="Values (comma-separated)" value={addItems}
              onChange={setAddItems} placeholder="100.50, 200.75, 50.25" />
            <FormField label="Decimal Places" value={addDigits}
              onChange={setAddDigits} type="number" placeholder="2" />
          </div>
          <div className="tool-result" style={{ marginTop: '0.75rem' }}>
            <div className="tool-result__label">Sum</div>
            {addition(addItems.split(',').map(s => s.trim()), parseInt(addDigits) || 2)}
          </div>
        </div>
      </Section>
    </>
  )
}
