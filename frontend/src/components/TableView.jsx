import { useState } from 'react'

export function TableView({ table }) {
    const [sortCol, setSortCol] = useState(null)
    const [sortDir, setSortDir] = useState('asc')

    if (!table) return null

    const handleHeaderClick = (col) => {
        if (sortCol === col) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortCol(col)
            setSortDir('asc')
        }
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

    return (
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
                {sortedRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
