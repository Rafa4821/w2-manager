import mapping from './mapping.json'
import backgroundOne from './blank-background-page-1.png'
import backgroundTwo from './blank-background-page-2.png'

const assets = [backgroundOne, backgroundTwo]
const AMOUNT = /^boxes\.\d+$|^earnings\.gross\./

function getValue(record, field) {
  const raw = field.path.split('.').reduce((value, key) => value?.[key], record)
  if (raw == null || raw === '') return ''
  if (field.type === 'checkbox') return raw === true ? 'X' : ''
  if (typeof raw === 'number' && AMOUNT.test(field.path)) return raw.toFixed(2)
  return String(raw)
}

export default function W22023Template({ data = {} }) {
  return (
    <div className="w2-2023-document">
      {assets.map((background, pageIndex) => (
        <div className="w2-2023-page" key={pageIndex}>
          <svg className="w2-2023-svg" viewBox="0 0 612 792" role="img"
               xmlns="http://www.w3.org/2000/svg"
               aria-label={`W-2 2023, page ${pageIndex + 1} of 2`}>
            <image href={background} x="0" y="0" width="612" height="792" />
            {pageIndex === 0 && mapping.fields.map((field) => {
              const value = getValue(data, field)
              if (!value) return null
              return (
                <text key={field.id} x={field.x} y={field.y}
                      fontFamily="Arial, Helvetica, sans-serif" fontSize={field.fontSize}
                      fontWeight={field.fontWeight} textAnchor={field.align === 'end' ? 'end' : 'start'}
                      textRendering="geometricPrecision" fill="#202020">
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
