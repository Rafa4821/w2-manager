import { useMemo } from 'react'
import mapping from './mapping.json'
import blankBackground from './blank-background.png'

function readValue(record, path) {
  const value = path.split('.').reduce((current, key) => current?.[key], record)
  if (value === null || value === undefined || value === '') return ''
  if (path.startsWith('boxes.13.')) return value === true ? 'X' : ''
  if (path.startsWith('boxes.') && typeof value === 'number') return value.toFixed(2)
  return String(value)
}

export default function W22022Template({ data = {} }) {
  const entries = useMemo(() => mapping.fields, [])
  return (
    <div className="w2-2022-document">
      <svg className="w2-2022-sheet" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 612 792" role="img" aria-label="W-2 2022: B, 2, C, 2">
        <image href={blankBackground} x="0" y="0" width="612" height="792" />
        {entries.map((entry) => {
          const value = readValue(data, entry.path)
          if (!value) return null
          return (
            <text key={entry.id} x={entry.x} y={entry.y}
              fontFamily={entry.fontFamily === 'Arial' ? 'Arial, Helvetica, sans-serif' : 'Courier New, Liberation Mono, monospace'}
              fontSize={entry.fontSize} textAnchor="start" fill="#231f20">
              {value}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
