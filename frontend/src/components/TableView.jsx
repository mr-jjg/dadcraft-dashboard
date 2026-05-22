import { useState, useEffect, useRef } from 'react'
import { formatMoney, formatTime } from '../utils/format'
import { CLASS_COLORS, FACTION_COLORS } from '../constants/wow'

function cellColor(col, value) {
    if (col === 'class')   return CLASS_COLORS[value]
    if (col === 'faction') return FACTION_COLORS[value]
    return undefined
}

const COLUMN_LABELS = {
    name:                     'Name',
    faction:                  'Faction',
    race:                     'Race',
    class:                    'Class',
    gender:                   'Gender',
    level:                    'Level',
    xp:                       'XP',
    totaltime:                'Total Time',
    leveltime:                'Level Time',
    money:                    'Money',
    zone:                     'Zone',
    online:                   'Online',
    in_battleground:          'In BG',
    guild:                    'Guild',
    is_guild_leader:          'Guild Leader',
    lifetime_honorable_kills: 'Lifetime HKs',
    lifetime_honor:           'Lifetime Honor',
    week_honorable_kills:     'Weekly HKs',
    week_honor:               'Weekly Honor',
}

const COLUMN_FORMATTERS = {
    money:     (val) => formatMoney(Number(val)),
    totaltime: (val) => formatTime(Number(val)),
    leveltime: (val) => formatTime(Number(val)),
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function TableView({ table, searchedFields, initialVisibleCols, pageSize, onPageSizeChange }) {
    const [sortCol, setSortCol] = useState(null)
    const [sortDir, setSortDir] = useState('asc')
    const [page, setPage] = useState(1)
    const [visibleCols, setVisibleCols] = useState(initialVisibleCols ? new Set(initialVisibleCols) : null)
    const [showColPanel, setShowColPanel] = useState(false)
    const colPanelRef = useRef(null)

    useEffect(() => {
        if (!showColPanel) return
        const handleClickOutside = (e) => {
            if (colPanelRef.current && !colPanelRef.current.contains(e.target)) {
                setShowColPanel(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [showColPanel])

    if (!table) return null

    const cols = visibleCols ?? new Set(table.columns)
    const visibleColumns = table.columns.filter(col => cols.has(col))
    const allSelected = table.columns.every(col => cols.has(col))

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

    const toggleCol = (col) => {
        const next = new Set(cols)
        if (next.has(col)) {
            if (next.size === 1) return
            next.delete(col)
        } else {
            next.add(col)
        }
        setVisibleCols(next)
    }

    const toggleAll = () => {
        if (allSelected) {
            setVisibleCols(new Set(table.columns.filter(col => searchedFields?.has(col))))
        } else {
            setVisibleCols(new Set(table.columns))
        }
    }

    const handleHeaderClick = (col) => {
        if (sortCol === col) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortCol(col)
            setSortDir('asc')
        }
        setPage(1)
    }

    return (
        <>
            <div ref={colPanelRef}>
                <button onClick={() => setShowColPanel(prev => !prev)}>
                    Columns
                </button>

                {showColPanel && (
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                            />
                            All columns
                        </label>
                        {table.columns.map(col => (
                            <label key={col}>
                                <input
                                    type="checkbox"
                                    checked={cols.has(col)}
                                    onChange={() => toggleCol(col)}
                                />
                                {COLUMN_LABELS[col] ?? col}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <table>
                <thead>
                    <tr>
                        {visibleColumns.map((col) => (
                            <th
                                key={col}
                                onClick={() => handleHeaderClick(col)}
                                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                            >
                                {COLUMN_LABELS[col] ?? col}
                                {sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                cols.has(table.columns[cellIndex]) && (
                                    <td key={cellIndex} style={{ color: cellColor(table.columns[cellIndex], cell) }}>
                                        {COLUMN_FORMATTERS[table.columns[cellIndex]]?.(cell) ?? cell}
                                    </td>
                                )
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

                <span>{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, sortedRows.length)} of {sortedRows.length}</span>

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
                            onPageSizeChange(Number(e.target.value))
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
