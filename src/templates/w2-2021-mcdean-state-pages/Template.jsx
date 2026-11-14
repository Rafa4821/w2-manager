import { useMemo } from 'react'
import mapping from './mapping.json'
import page1 from './background-page-1.png'
import page2 from './background-page-2.png'
import page3 from './background-page-3.png'

const backgrounds = [page1, page2, page3]
const getPath = (root, path) => path.split('.').reduce((object, part) => object?.[part], root)

function resolveFieldValue(field, data) {
  const raw = field.path.startsWith('state.') && Array.isArray(data.stateRecords)
    ? getPath(data.stateRecords[field.page] || {}, field.path.slice(6))
    : getPath(data, field.path)
  return raw == null ? '' : String(raw)
}

export default function W22021MCDeanTemplate({ data = {} }) {
  const fields = useMemo(() => mapping.fields.map((field, i) => ({
    ...field, key: `field-${i}`, text: resolveFieldValue(field, data)
  })), [data])
  return (
    <div className="w2mcdean21-doc">
      {backgrounds.map((background, pageIndex) => (
        <div key={pageIndex} className="w2mcdean21-viewport">
          <div className="w2mcdean21-page" aria-label={`W-2 2021 state record, page ${pageIndex + 1} of 3`}>
            <img className="w2mcdean21-background" alt="" src={background} draggable={false} />
            <svg className="w2mcdean21-values" viewBox={`0 0 ${mapping.pageSizePt[0]} ${mapping.pageSizePt[1]}`} aria-hidden="true">
              {fields.filter((f) => f.page === pageIndex && f.text).map((f) => (
                <text key={f.key} className="w2mcdean21-text"
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
