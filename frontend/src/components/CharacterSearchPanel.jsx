import { useState, useEffect } from 'react'
import { CharacterFilterRow } from './CharacterFilterRow'
import { CharacterQuickSearch } from './CharacterQuickSearch'
import { CollapseHandle } from './CollapseHandle'
import { TableView } from './TableView'
import { fetchCharacterFields, fetchCharacterSearch } from '../api/characterSearch'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200

let _filterId = 0
function nextId() { return ++_filterId }

function emptyFilter(id) {
    return { id, field: '', value: '', min: '', max: '', values: [] }
}

function validateFilters(activeFilters, fieldMap) {
    for (const f of activeFilters) {
        const def = fieldMap[f.field]
        if (!def) return `Unknown field: ${f.field}`

        if (def.type === 'string' && !f.value.trim())
            return `${def.label} requires a value`

        if (def.type === 'string_in' && f.values.length === 0)
            return `${def.label} requires at least one value`

        if (def.type === 'range' && f.min === '' && f.max === '')
            return `${def.label} requires at least min or max`

        if (def.type === 'range' && f.min !== '' && f.max !== '' && Number(f.min) > Number(f.max))
            return `${def.label}: min must be \u2264 max`

        if (def.type === 'enum' && f.values.length === 0)
            return `${def.label} requires at least one selection`

        if (def.type === 'boolean' && f.value !== '0' && f.value !== '1')
            return `${def.label} requires a selection`
    }
    return null
}

function buildFiltersPayload(activeFilters, fieldMap) {
    return activeFilters.map(f => {
        const def = fieldMap[f.field]
        switch (def.type) {
            case 'string':
                return { field: f.field, op: 'like', value: f.value.trim() }
            case 'string_in':
                return { field: f.field, op: 'in', values: f.values }
            case 'range':
                return {
                    field: f.field, op: 'range',
                    ...(f.min !== '' ? { min: Number(f.min) } : {}),
                    ...(f.max !== '' ? { max: Number(f.max) } : {}),
                }
            case 'enum':
                return { field: f.field, op: 'in', values: f.values }
            case 'boolean':
                return { field: f.field, op: 'eq', value: f.value }
            default:
                return null
        }
    }).filter(Boolean)
}

export function CharacterSearchPanel() {
    const [fields, setFields] = useState([])
    const [fieldsError, setFieldsError] = useState(null)
    const [activeFilters, setActiveFilters] = useState([])
    const [activeSearchedFields, setActiveSearchedFields] = useState(null)
    const [limit, setLimit] = useState(DEFAULT_LIMIT)
    const [results, setResults] = useState(null)
    const [resultKey, setResultKey] = useState(0)
    const [pageSize, setPageSize] = useState(25)
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)
    const [validationError, setValidationError] = useState(null)
    const [orderBy, setOrderBy] = useState('')
    const [orderDir, setOrderDir] = useState('asc')
    const [quickVisibleCols, setQuickVisibleCols] = useState(null)
    const [controlsOpen, setControlsOpen] = useState(true)

    useEffect(() => {
        fetchCharacterFields().then(setFields).catch(setFieldsError)
    }, [])

    const fieldMap = Object.fromEntries(fields.map(f => [f.field, f]))
    const usedFields = new Set(activeFilters.map(f => f.field).filter(Boolean))

    const removeFilter = (id) => {
        setActiveFilters(prev => prev.filter(f => f.id !== id))
    }

    const updateFilter = (id, updates) => {
        setActiveFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    const handleApply = async () => {
        setValidationError(null)
        setSearchError(null)

        const filledFilters = activeFilters.filter(f => f.field)

        const error = validateFilters(filledFilters, fieldMap)
        if (error) {
            setValidationError(error)
            return
        }

        const payload = buildFiltersPayload(filledFilters, fieldMap)
        setActiveFilters(filledFilters)
        setSearching(true)
        setControlsOpen(false)
        try {
            const result = await fetchCharacterSearch(payload, limit, orderBy, orderDir)
            setResults(result)
            setResultKey(prev => prev + 1)
            setActiveSearchedFields(new Set(['name', ...filledFilters.map(f => f.field)]))
        } catch (err) {
            setSearchError(err)
        } finally {
            setSearching(false)
        }
    }

    const handleReset = () => {
        setActiveFilters([])
        setLimit(DEFAULT_LIMIT)
        setResults(null)
        setValidationError(null)
        setSearchError(null)
        setOrderBy('')
        setOrderDir('asc')
        setQuickVisibleCols(null)
        setControlsOpen(true)
    }

    const handleQuickSearch = ({ filters, orderBy, orderDir, limit, visibleCols }) => {
        setActiveFilters(filters.map(f => ({ ...f, id: nextId() })))
        setOrderBy(orderBy ?? '')
        setOrderDir(orderDir ?? 'asc')
        setLimit(limit ?? DEFAULT_LIMIT)
        setResults(null)
        setValidationError(null)
        setSearchError(null)
        setQuickVisibleCols(visibleCols ?? null)
    }

    if (fieldsError) return <p>Error loading fields: {fieldsError.message}</p>
    if (fields.length === 0) return <p>Loading...</p>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2>Character Search</h2>

            <div className="panel-layout" style={{ flex: 1, minHeight: 0 }}>
                {controlsOpen && (
                    <div className="panel-controls character-search-controls">
                        <div  style={{ display: 'flex', flexShrink: 0 }}>
                            <button className='btn-primary' onClick={handleApply} disabled={searching}>
                                {searching ? 'Searching...' : 'Apply'}
                            </button>
                            <button className='btn-tertiary' onClick={handleReset}>Reset</button>
                        </div>

                        <CharacterQuickSearch onSelect={handleQuickSearch} />

                        <div>
                            <label>
                                Order by:
                                <select
                                    value={orderBy}
                                    onChange={e => setOrderBy(e.target.value)}
                                    aria-label="Order by field"
                                >
                                    <option value="">None</option>
                                    {fields.map(f => (
                                        <option key={f.field} value={f.field}>{f.label}</option>
                                    ))}
                                </select>
                            </label>

                            <select
                                value={orderDir}
                                onChange={e => setOrderDir(e.target.value)}
                                aria-label="Order direction"
                                disabled={!orderBy}
                            >
                                <option value="asc">ASC</option>
                                <option value="desc">DESC</option>
                            </select>

                            <label>
                                Limit:
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="input-field"
                                    value={limit}
                                    onChange={e => setLimit(Math.min(MAX_LIMIT, Math.max(1, Number(e.target.value))))}
                                    aria-label="Result limit"
                                    style={{ width: '80px' }}
                                />
                            </label>
                        </div>

                        <div className="filters-scroll">

                            {activeFilters.map(filter => (
                                <CharacterFilterRow
                                    key={filter.id}
                                    filter={filter}
                                    fields={fields}
                                    usedFields={usedFields}
                                    onChange={updateFilter}
                                    onRemove={removeFilter}
                                />
                            ))}

                            <select
                                value=""
                                onChange={e => {
                                    if (!e.target.value) return
                                    const def = fieldMap[e.target.value]
                                    setActiveFilters(prev => [...prev, {
                                        ...emptyFilter(nextId()),
                                        field: e.target.value,
                                        value: def?.type === 'boolean' ? '1' : '',
                                    }])
                                }}
                                disabled={activeFilters.length >= fields.length}
                                aria-label="Add filter"
                            >
                                <option value="">Add filter...</option>
                                {fields.map(f => (
                                    <option key={f.field} value={f.field} disabled={usedFields.has(f.field)}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <CollapseHandle
                    orientation="vertical"
                    isOpen={controlsOpen}
                    onToggle={() => setControlsOpen(f => !f)}
                />

                <div className="panel-main">
                    {validationError && <p role="alert">{validationError}</p>}
                    {searchError && <p role="alert">Search error: {searchError.message}</p>}

                    {!results && !searching && !validationError && !controlsOpen && (
                        <p>Configure filters and click Apply to search.</p>
                    )}

                    {results && results.rows.length === 0 && !controlsOpen && <p>No results found.</p>}

                    {results && results.rows.length > 0 && (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <TableView
                                key={resultKey}
                                table={results}
                                searchedFields={activeSearchedFields}
                                initialVisibleCols={quickVisibleCols}
                                pageSize={pageSize}
                                onPageSizeChange={setPageSize}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
