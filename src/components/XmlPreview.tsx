import { useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'

interface XmlPreviewProps {
  xml: string
  error?: string | null
  codeSnippet?: string
}

export function XmlPreview({ xml, error, codeSnippet }: XmlPreviewProps) {
  const [tab, setTab] = useState<'xml' | 'code'>('xml')
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [xml, codeSnippet, tab])

  const content = tab === 'xml' ? xml : (codeSnippet || '')

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="xml-preview">
      <div className="xml-preview__header">
        <div className="xml-preview__tabs">
          <button
            className={`xml-preview__tab ${tab === 'xml' ? 'xml-preview__tab--active' : ''}`}
            onClick={() => setTab('xml')}
          >
            XML Output
          </button>
          {codeSnippet && (
            <button
              className={`xml-preview__tab ${tab === 'code' ? 'xml-preview__tab--active' : ''}`}
              onClick={() => setTab('code')}
            >
              Code
            </button>
          )}
        </div>
        <div className="xml-preview__actions">
          <button
            className={`btn btn--sm copy-btn ${copied ? 'copy-btn--copied' : ''}`}
            onClick={handleCopy}
            disabled={!content}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="xml-preview__error">{error}</div>
      ) : content ? (
        <div className="xml-preview__body">
          <pre>
            <code
              ref={codeRef}
              className={tab === 'xml' ? 'language-markup' : 'language-javascript'}
            >
              {content}
            </code>
          </pre>
        </div>
      ) : (
        <div className="xml-preview__empty">
          Fill in the form to generate XML output
        </div>
      )}
    </div>
  )
}
