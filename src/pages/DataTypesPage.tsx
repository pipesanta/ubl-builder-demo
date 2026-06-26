import { useState, useEffect, useRef } from 'react'
import { UdtTypes } from 'ubl-builder'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'

const TYPE_DEFINITIONS = [
  { name: 'UdtAmount', category: 'Monetary', xsd: 'XsdDecimal', cct: 'CctAmountType',
    desc: 'A number of monetary units specified using a given unit of currency.',
    attrs: [{ key: 'currencyID', label: 'Currency ID', placeholder: 'COP', default: 'COP' }],
    create: (val: string, attrs: Record<string, string>) => new UdtTypes.UdtAmount(val, { currencyID: attrs.currencyID || 'COP' }),
  },
  { name: 'UdtText', category: 'Text', xsd: 'XsdString', cct: 'CctTextType',
    desc: 'A character string (i.e. a finite set of characters), generally in the form of words of a language.',
    attrs: [{ key: 'languageID', label: 'Language ID', placeholder: 'es', default: '' }],
    create: (val: string, attrs: Record<string, string>) => new UdtTypes.UdtText(val, attrs.languageID ? { languageID: attrs.languageID } : {}),
  },
  { name: 'UdtIdentifier', category: 'Text', xsd: 'XsdString', cct: 'CctIdentifier',
    desc: 'A character string to identify and distinguish uniquely one instance of an object.',
    attrs: [
      { key: 'schemeID', label: 'Scheme ID', placeholder: '9', default: '' },
      { key: 'schemeName', label: 'Scheme Name', placeholder: '31', default: '' },
    ],
    create: (val: string, attrs: Record<string, string>) => new UdtTypes.UdtIdentifier(val, {
      ...(attrs.schemeID ? { schemeID: attrs.schemeID } : {}),
      ...(attrs.schemeName ? { schemeName: attrs.schemeName } : {}),
    }),
  },
  { name: 'UdtCode', category: 'Text', xsd: 'XsdString', cct: 'CctCode',
    desc: 'A character string (letters, figures, or symbols) that for brevity and/or language independence may be used to represent or replace a definitive value or text of an attribute.',
    attrs: [
      { key: 'listID', label: 'List ID', placeholder: '', default: '' },
      { key: 'listAgencyID', label: 'List Agency ID', placeholder: '6', default: '' },
    ],
    create: (val: string, attrs: Record<string, string>) => new UdtTypes.UdtCode(val, {
      listID: attrs.listID || '', listAgencyID: attrs.listAgencyID || '',
      listAgencyName: '', listName: '', listVersionID: '', name: '', languageID: '', listURI: '', listSchemeURI: '',
    } as any),
  },
  { name: 'UdtDate', category: 'Date/Time', xsd: 'XsdDate', cct: '-',
    desc: 'One calendar day according the Gregorian calendar.',
    attrs: [],
    create: (val: string) => new UdtTypes.UdtDate(val),
  },
  { name: 'UdtTime', category: 'Date/Time', xsd: 'XsdTime', cct: '-',
    desc: 'An instance of time that occurs every day.',
    attrs: [],
    create: (val: string) => new UdtTypes.UdtTime(val),
  },
  { name: 'UdtName', category: 'Text', xsd: 'XsdString', cct: 'CctTextType',
    desc: 'A character string that constitutes the distinctive designation of a person, place, thing or concept.',
    attrs: [],
    create: (val: string) => new UdtTypes.UdtName(val),
  },
  { name: 'UdtQuantity', category: 'Numeric', xsd: 'XsdDecimal', cct: 'CctQuantity',
    desc: 'A counted number of non-monetary units, possibly including a fractional part.',
    attrs: [{ key: 'unitCode', label: 'Unit Code', placeholder: 'EA', default: '' }],
    create: (val: string, attrs: Record<string, string>) => new UdtTypes.UdtQuantity(val, { unitCode: attrs.unitCode || 'EA' } as any),
  },
  { name: 'UdtIndicator', category: 'Boolean', xsd: 'XsdBoolean', cct: '-',
    desc: 'A list of two mutually exclusive Boolean values that express the only possible states of a property.',
    attrs: [],
    create: (val: string) => new (UdtTypes.UdtIndicator as any)(val === 'true'),
  },
  { name: 'UdtNumeric', category: 'Numeric', xsd: 'XsdDecimal', cct: 'CctNumeric',
    desc: 'Numeric information that is assigned or is determined by calculation, counting, or sequencing.',
    attrs: [],
    create: (val: string) => new UdtTypes.UdtNumeric(val),
  },
  { name: 'UdtPercent', category: 'Numeric', xsd: 'XsdDecimal', cct: 'CctNumeric',
    desc: 'A numeric value expressed as a percentage.',
    attrs: [],
    create: (val: string) => new UdtTypes.UdtPercent(val),
  },
  { name: 'UdtMeasure', category: 'Numeric', xsd: 'XsdDecimal', cct: 'CctMeasure',
    desc: 'A numeric value determined by measuring an object using a specified unit of measure.',
    attrs: [{ key: 'unitCode', label: 'Unit Code', placeholder: 'KGM', default: '' }],
    create: (val: string, attrs: Record<string, string>) => new UdtTypes.UdtMeasure(val, { unitCode: attrs.unitCode || 'KGM' } as any),
  },
  { name: 'UdtRate', category: 'Monetary', xsd: 'XsdDecimal', cct: 'CctNumeric',
    desc: 'A numeric expression of a rate that is assigned or is determined by calculation, counting, or sequencing.',
    attrs: [],
    create: (val: string) => new (UdtTypes.UdtRate as any)(val, {}),
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(TYPE_DEFINITIONS.map(t => t.category)))]

function jsonToXml(tag: string, json: Record<string, unknown>): string {
  const attrs = Object.entries(json)
    .filter(([k]) => k.startsWith('@'))
    .map(([k, v]) => `${k.slice(1)}="${v}"`)
    .join(' ')
  const text = json['#text'] ?? ''
  const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`
  return `${openTag}${text}</${tag}>`
}

export function DataTypesPage() {
  const [selected, setSelected] = useState(TYPE_DEFINITIONS[0])
  const [value, setValue] = useState('100000.00')
  const [attrs, setAttrs] = useState<Record<string, string>>({})
  const [category, setCategory] = useState('All')
  const codeRef = useRef<HTMLElement>(null)

  const filteredTypes = category === 'All'
    ? TYPE_DEFINITIONS
    : TYPE_DEFINITIONS.filter(t => t.category === category)

  let jsonOutput = ''
  let xmlOutput = ''
  let errorMsg = ''

  try {
    const instance = selected.create(value, attrs)
    const json = instance.parseToJson()
    jsonOutput = JSON.stringify(json, null, 2)
    xmlOutput = jsonToXml(`cbc:${selected.name.replace('Udt', '')}`, json)
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
  }

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current)
  }, [xmlOutput])

  useEffect(() => {
    const defaults: Record<string, string> = {}
    selected.attrs.forEach(a => { if (a.default) defaults[a.key] = a.default })
    setAttrs(defaults)
    if (selected.name === 'UdtIndicator') setValue('true')
    else if (selected.name === 'UdtDate') setValue(new Date().toISOString().split('T')[0])
    else if (selected.name === 'UdtTime') setValue('10:00:00-05:00')
    else setValue('100000.00')
  }, [selected])

  return (
    <>
      <div className="page-header">
        <h1>Data Types Explorer</h1>
        <p>Explore UBL 2.1 Unqualified Data Types (UDT). Each type wraps a value with optional XML attributes.</p>
      </div>

      {/* Type Hierarchy */}
      <div className="type-hierarchy">
        <div className="type-hierarchy__level type-hierarchy__level--xsd">{selected.xsd}</div>
        <span className="type-hierarchy__arrow">&rarr;</span>
        {selected.cct !== '-' ? (
          <>
            <div className="type-hierarchy__level type-hierarchy__level--cct">{selected.cct}</div>
            <span className="type-hierarchy__arrow">&rarr;</span>
          </>
        ) : null}
        <div className="type-hierarchy__level type-hierarchy__level--udt">{selected.name}</div>
      </div>

      {/* Category filter tabs */}
      <div className="tabs">
        {CATEGORIES.map(cat => (
          <button key={cat}
            className={`tab ${category === cat ? 'tab--active' : ''}`}
            onClick={() => setCategory(cat)}
          >{cat}</button>
        ))}
      </div>

      <div className="builder-layout">
        <div className="builder-layout__form">
          {/* Type selector */}
          <div className="section">
            <div className="section__body" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {filteredTypes.map(t => (
                  <button key={t.name}
                    className={`btn btn--sm ${selected.name === t.name ? 'btn--primary' : ''}`}
                    onClick={() => setSelected(t)}
                  >{t.name}</button>
                ))}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                {selected.desc}
              </p>

              <div className="form-grid">
                {selected.name === 'UdtIndicator' ? (
                  <div className="form-field">
                    <label>Value</label>
                    <select value={value} onChange={e => setValue(e.target.value)}>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-field">
                    <label>Value <span className="required">*</span></label>
                    <input
                      type="text"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      placeholder="Enter value..."
                    />
                  </div>
                )}

                {selected.attrs.map(attr => (
                  <div key={attr.key} className="form-field">
                    <label>{attr.label}</label>
                    <input
                      type="text"
                      value={attrs[attr.key] || ''}
                      onChange={e => setAttrs(prev => ({ ...prev, [attr.key]: e.target.value }))}
                      placeholder={attr.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JSON output */}
          <div className="tool-section">
            <h3>JSON (parseToJson)</h3>
            {errorMsg ? (
              <div className="xml-preview__error">{errorMsg}</div>
            ) : (
              <div className="tool-result">
                <pre style={{ margin: 0 }}>{jsonOutput}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="builder-layout__preview">
          <div className="xml-preview">
            <div className="xml-preview__header">
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>XML Output</span>
            </div>
            {errorMsg ? (
              <div className="xml-preview__error">{errorMsg}</div>
            ) : (
              <div className="xml-preview__body">
                <pre><code ref={codeRef} className="language-markup">{xmlOutput}</code></pre>
              </div>
            )}
          </div>

          {/* Code snippet */}
          <div className="tool-section" style={{ marginTop: '1rem' }}>
            <h3>TypeScript Code</h3>
            <div className="tool-result">
              <pre style={{ margin: 0 }}>{`import { UdtTypes } from 'ubl-builder'\n\nconst value = new UdtTypes.${selected.name}(${
                selected.name === 'UdtIndicator' ? value : `'${value}'`
              }${selected.attrs.length > 0 ? `, {\n${selected.attrs.filter(a => attrs[a.key]).map(a => `  ${a.key}: '${attrs[a.key]}'`).join(',\n')}\n}` : ''})\n\nconst json = value.parseToJson()\n// ${jsonOutput.replace(/\n/g, '')}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
