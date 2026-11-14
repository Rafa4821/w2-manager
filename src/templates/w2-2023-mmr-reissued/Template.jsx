import { useMemo } from 'react'
import mapping from './mapping.json'
import background from './background-page-1.png'

export default function W22023MMRTemplate({ data = {} }) {
  const fields = useMemo(() => mapping.fields.map((field, index) => ({
    ...field,
    id: `${field.copy}-${field.key}-${index}`,
    value: String(field.key.split('.').reduce((obj, key) => obj?.[key], data) ?? ''),
  })), [data])
  return (
    <div className="mmr23-template-viewport">
      <div className="mmr23-page" role="img" aria-label="W-2 2023 MMR Reissued">
        <img src={background} className="mmr23-static" alt="" draggable="false" />
        <svg className="mmr23-values" viewBox="0 0 612 792" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {fields.filter((item) => item.value).map((item) => (
            <text key={item.id} x={item.x} y={item.baselineY} fontSize={item.fontSize}
              className="mmr23-value">
              {item.value}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
