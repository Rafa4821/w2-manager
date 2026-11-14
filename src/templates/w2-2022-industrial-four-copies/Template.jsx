import { useMemo } from 'react'
import mapping from './mapping.json'
import page1 from './background-page-1.png'

const backgrounds = [page1]
const getPath = (root, path) => path.split('.').reduce((object, part) => object?.[part], root)

function resolveFieldValue(field, data) {
  const raw = field.path.startsWith('state.') && Array.isArray(data.stateRecords)
    ? getPath(data.stateRecords[field.page] || {}, field.path.slice(6))
    : getPath(data, field.path)
  return raw == null ? '' : String(raw)
}

export default function W22022IndustrialTemplate({ data = {} }) {
  const fields = useMemo(() => mapping.fields.map((field, i) => ({
    ...field, key: `field-${i}`, text: resolveFieldValue(field, data)
  })), [data])
  return (
    <div className="w2industrial22-doc">
      {backgrounds.map((background, pageIndex) => (
        <div key={pageIndex} className="w2industrial22-viewport">
          <div className="w2industrial22-page" aria-label="W-2 2022 Industrial, four copies">
            <img className="w2industrial22-background" alt="" src={background} draggable={false} />
            <svg className="w2industrial22-values" viewBox={`0 0 ${mapping.pageSizePt[0]} ${mapping.pageSizePt[1]}`} aria-hidden="true">
              {fields.filter((f) => f.page === pageIndex && f.text).map((f) => (
                <text key={f.key} className="w2industrial22-text"
                  x={f.x} y={f.baselineY} fontSize={f.fontSize} fontFamily={f.fontFamily} fontWeight={f.fontWeight || 'normal'}>
                  {f.text}
                </text>
              ))}
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
