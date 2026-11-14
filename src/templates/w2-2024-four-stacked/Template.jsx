import mapping from './mapping.json'
import background1 from './blank-background-page-1.png'
import background2 from './blank-background-page-2.png'

const BACKGROUNDS = [background1, background2]
const MONEY = /^boxes\.\d+$/

function getValue(data, field) {
  if (field.path === 'flags.void' && field.region !== 'VOID') return ''
  const value = field.path.split('.').reduce((a, k) => a?.[k], data)
  if (value === null || value === undefined || value === '') return ''
  if (field.type === 'checkbox') return value === true ? 'X' : ''
  if (MONEY.test(field.path)) {
    if (typeof value === 'number') return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return String(value)
  }
  return String(value)
}

export default function W22024Template({ data = {} }) {
  return (
    <div className="w2-2024-document">
      {BACKGROUNDS.map((background, pageIndex) => (
        <div className="w2-2024-page" key={pageIndex}>
          <svg className="w2-2024-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792"
               role="img" aria-label={`W-2 2024, page ${pageIndex + 1} of 2`}>
            <image href={background} x="0" y="0" width="612" height="792" />
            {pageIndex === 0 && mapping.fields.map((field) => {
              const value = getValue(data, field)
              if (!value) return null
              return (
                <text key={field.id} x={field.x} y={field.y} fill="#202020"
                      fontSize={field.fontSize} fontFamily="Arial, Helvetica, sans-serif"
                      fontWeight={field.fontWeight} textAnchor={field.align === 'end' ? 'end' : 'start'}
                      textRendering="geometricPrecision">
                  {value}
                </text>
              )
            })}
          </svg>
        </div>
      ))}
    </div>
  )
}
