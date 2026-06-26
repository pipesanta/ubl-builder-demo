interface FormFieldProps {
  label: string
  value: string | boolean
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'time' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  className?: string
}

export function FormField({
  label, value, onChange, type = 'text',
  placeholder, required, options, className,
}: FormFieldProps) {
  if (type === 'checkbox') {
    return (
      <div className={`form-field form-field--checkbox ${className || ''}`}>
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(String(e.target.checked))}
        />
        <label>{label}</label>
      </div>
    )
  }

  if (type === 'select') {
    return (
      <div className={`form-field ${className || ''}`}>
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <select value={value as string} onChange={(e) => onChange(e.target.value)}>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className={`form-field ${className || ''}`}>
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    )
  }

  return (
    <div className={`form-field ${className || ''}`}>
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
