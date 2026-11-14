import mapping from './mapping.json'
import background from './blank-background-page-1.png'

function getValue(data, field) {
  const value = field.path.split('.').reduce((acc, part) => acc?.[part], data)
  if (value == null || value === '') return ''
  if (field.type === 'checkbox') return value === true ? 'X' : ''
  if (field.type === 'amount' && typeof value === 'number') {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return String(value)
}

export default function W22025Template({ data = {} }) {
  return (
    <div className="w2-2025-document">
      <div className="w2-2025-page">
        <svg className="w2-2025-svg" viewBox="0 0 612 792" xmlns="http://www.w3.org/2000/svg"
             role="img" aria-label="W-2 2025, copies B, C and 2">
          <image href={background} x="0" y="0" width="612" height="792" />
          {mapping.fields.map((field) => {
            const value = getValue(data, field)
            if (!value) return null
            return (
              <text key={field.id} x={field.x} y={field.y} fill="#141414"
                    fontSize={field.fontSize} fontFamily="Arial, Helvetica, sans-serif"
                    fontWeight={field.fontWeight}
                    textAnchor={field.align === 'end' ? 'end' : 'start'}
                    textRendering="geometricPrecision">
                {value}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
