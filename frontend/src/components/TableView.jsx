import { useState } from 'react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function TableView({ table }) {
    const [sortCol, setSortCol] = useState(null)
    const [sortDir, setSortDir] = useState('asc')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)

    if (!table) return null

    const handleHeaderClick = (col) => {
        if (sortCol === col) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortCol(col)
            setSortDir('asc')
        }
        setPage(1)
    }

    const sortedRows = sortCol === null ? table.rows : [...table.rows].sort((a, b) => {
        const colIndex = table.columns.indexOf(sortCol)
        const aVal = a[colIndex]
        const bVal = b[colIndex]

        const aNum = Number(aVal)
        const bNum = Number(bVal)
        const numeric = !isNaN(aNum) && !isNaN(bNum)

        const cmp = numeric ? aNum - bNum : aVal.localeCompare(bVal)
        return sortDir === 'asc' ? cmp : -cmp
    })

    const totalPages = Math.ceil(sortedRows.length / pageSize)
    const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize)

    return (
        <>
            <table>
                <thead>
                    <tr>
                        {table.columns.map((col) => (
                            <th
                                key={col}
                                onClick={() => handleHeaderClick(col)}
                                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                            >
                                {col}
                                {sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div>
                <button
                    onClick={() => setPage(prev => prev - 1)}
                    disabled={page === 1}
                >
                    Prev
                </button>

                <span>Page {page} of {totalPages}</span>

                <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </button>

                <label>
                    Show:
                    <select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value))
                            setPage(1)
                        }}
                        aria-label="Page size"
                    >
                        {PAGE_SIZE_OPTIONS.map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
            </div>
        </>
    )
}
