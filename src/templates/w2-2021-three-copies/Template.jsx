import { useMemo } from 'react'
import mapping from './mapping.json'
import blankBackground from './blank-background.png'

function readValue(record, path) {
  if (path === 'year') return record?.year ?? 2021
  const value = path.split('.').reduce((acc, part) => acc?.[part], record)
  if (value === null || value === undefined || value === '') return ''
  if (path.startsWith('boxes.13.')) return value === true ? 'X' : ''
  if (path.startsWith('boxes.') && typeof value === 'number') {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (path === 'stateTax.combinedStateAndEmployerId') return String(value)
  return String(value)
}

export default function W22021Template({ data = {} }) {
  const entries = useMemo(() => mapping.fields.map((f, i) => ({ ...f, index: i })), [])
  return (
    <div className="w2-2021-document">
      <svg className="w2-2021-sheet" viewBox="0 0 612 792" role="img"
        aria-label="W-2 2021: copies B, 2, and C" xmlns="http://www.w3.org/2000/svg">
        <image href={blankBackground} x="0" y="0" width="612" height="792" />
        {entries.map((entry) => {
          const value = readValue(data, entry.path)
          if (value === '') return null
          return (
            <text key={`${entry.copy}:${entry.path}:${entry.index}`}
              x={entry.x} y={entry.y}
              textAnchor={entry.align === 'end' ? 'end' : 'start'}
              fontFamily={entry.fontFamily === 'Arial' ? 'Arial, Helvetica, sans-serif' : 'Courier New, Liberation Mono, monospace'}
              fontSize={entry.fontSize}
              fontWeight={entry.path === 'year' ? 700 : 400}
              fill="#000000">
              {value}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
