import { useMemo } from 'react'
import mapping from './mapping.json'
import bg1 from './background-page-1.png'
import bg2 from './background-page-2.png'

const readPath = (object, path) => path.split('.').reduce((result, part) => result?.[part], object)
const viewValue = (field, data) => {
  const value = readPath(data, field.path)
  if (value == null || value === '') return ''
  if (field.part === 'currencySymbol') return value === 'N/A' ? '' : '$'
  if (field.part === 'fullCurrency') return value === 'N/A' ? 'N/A' : `$${value}`
  return String(value)
}

export default function W22021EarningsTemplate({ data = {} }) {
  const fields = useMemo(() => mapping.fields.map((field, index) => ({
    ...field, id: `${field.copy}-${field.path}-${index}`, value: viewValue(field, data)
  })), [data])
  return (
    <div className="w2e21-document">
      {[bg1, bg2].map((background, pageIndex) => (
        <div key={pageIndex} className="w2e21-viewport">
          <div className="w2e21-page" role="img" aria-label={`W-2 2021 + Earnings, page ${pageIndex + 1} of 2`}>
            <img className="w2e21-background" src={background} alt="" draggable="false" />
            <svg className="w2e21-values" viewBox="0 0 612 792" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {fields.filter((f) => f.page === pageIndex && f.value).map((f) => (
                <text key={f.id} x={f.x} y={f.baselineY} fontSize={f.fontSize}
                  fontWeight={f.fontWeight || 'normal'}
                  fontFamily={f.fontFamily || 'Courier New, Courier, monospace'} className="w2e21-dynamic">
                  {f.value}
                </text>
              ))}
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
