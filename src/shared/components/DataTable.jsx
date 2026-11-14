import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 8,
  onRowClick,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your search or filters.',
  actions,
}) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const filteredData = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        if (!col.searchable && col.searchable !== undefined) return false
        const val = col.accessor ? row[col.accessor] : ''
        return String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData
    const col = columns.find((c) => c.accessor === sortColumn)
    if (!col) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn] ?? ''
      const bVal = b[sortColumn] ?? ''
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filteredData, sortColumn, sortDirection, columns])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedData = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSort = (accessor) => {
    if (sortColumn === accessor) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(accessor)
      setSortDirection('asc')
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
      {/* Toolbar */}
      {(searchable || actions) && (
        <div className="tw:flex tw:flex-col sm:tw:flex-row tw:items-start sm:tw:items-center tw:justify-between tw:gap-3 tw:p-4 tw:border-b tw:border-gray-100">
          {searchable && (
            <div className="tw:relative tw:w-full sm:tw:w-72">
              <Search className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:h-4 tw:w-4 tw:text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="tw:w-full tw:pl-9 tw:pr-3 tw:py-2 tw:text-sm tw:border tw:border-gray-200 tw:rounded-lg focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 focus:tw:border-transparent tw:transition"
              />
            </div>
          )}
          {actions && <div className="tw:flex tw:gap-2 tw:flex-shrink-0">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="tw:overflow-x-auto">
        <table className="tw:w-full tw:text-sm">
          <thead>
            <tr className="tw:border-b tw:border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  className={`tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:bg-gray-50/50 ${
                    col.sortable !== false ? 'tw:cursor-pointer hover:tw:bg-gray-100/50 tw:select-none' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                >
                  <div className="tw:flex tw:items-center tw:gap-1">
                    {col.header}
                    {sortColumn === col.accessor && (
                      <span className="tw:text-indigo-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tw:divide-y tw:divide-gray-50">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="tw:px-4 tw:py-12 tw:text-center">
                  <p className="tw:text-sm tw:font-medium tw:text-gray-900">{emptyTitle}</p>
                  <p className="tw:text-xs tw:text-gray-500 tw:mt-1">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`tw:border-b tw:border-gray-50 hover:tw:bg-gray-50/50 tw:transition-colors ${
                    onRowClick ? 'tw:cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.accessor || col.header} className={`tw:px-4 tw:py-3 tw:text-gray-700 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedData.length > pageSize && (
        <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-t tw:border-gray-100">
          <p className="tw:text-xs tw:text-gray-500">
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="tw:flex tw:items-center tw:gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 disabled:tw:opacity-30 disabled:tw:cursor-not-allowed tw:transition"
            >
              <ChevronsLeft className="tw:h-4 tw:w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 disabled:tw:opacity-30 disabled:tw:cursor-not-allowed tw:transition"
            >
              <ChevronLeft className="tw:h-4 tw:w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page
              if (totalPages <= 5) {
                page = i + 1
              } else if (safePage <= 3) {
                page = i + 1
              } else if (safePage >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = safePage - 2 + i
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:transition ${
                    safePage === page
                      ? 'tw:bg-indigo-600 tw:text-white'
                      : 'tw:text-gray-600 hover:tw:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 disabled:tw:opacity-30 disabled:tw:cursor-not-allowed tw:transition"
            >
              <ChevronRight className="tw:h-4 tw:w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 disabled:tw:opacity-30 disabled:tw:cursor-not-allowed tw:transition"
            >
              <ChevronsRight className="tw:h-4 tw:w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
