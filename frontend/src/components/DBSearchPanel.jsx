import { useState, useEffect } from 'react'
import { fetchCharacterFields, fetchCharacterSearch } from '../api/characterSearch'
import { CharacterFilterRow } from './CharacterFilterRow'
import { TableView } from './TableView'

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

export function DBSearchPanel() {
    const [fields, setFields] = useState([])
    const [fieldsError, setFieldsError] = useState(null)
    const [activeFilters, setActiveFilters] = useState([])
    const [activeSearchedFields, setActiveSearchedFields] = useState(null)
    const [limit, setLimit] = useState(DEFAULT_LIMIT)
    const [results, setResults] = useState(null)
    const [resultKey, setResultKey] = useState(0)
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)
    const [validationError, setValidationError] = useState(null)

    useEffect(() => {
        fetchCharacterFields().then(setFields).catch(setFieldsError)
    }, [])

    const fieldMap = Object.fromEntries(fields.map(f => [f.field, f]))
    const usedFields = new Set(activeFilters.map(f => f.field).filter(Boolean))

    const addFilter = () => {
        setActiveFilters(prev => [...prev, emptyFilter(nextId())])
    }

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
        try {
            const result = await fetchCharacterSearch(payload, limit)
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
    }

    if (fieldsError) return <p>Error loading fields: {fieldsError.message}</p>
    if (fields.length === 0) return <p>Loading...</p>

    return (
        <div>
            <h2>Character Search</h2>

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
                    setActiveFilters(prev => [...prev, { ...emptyFilter(nextId()), field: e.target.value }])
                }}
                disabled={activeFilters.length >= fields.length}
                aria-label="Add filter"
            >
                <option value="">Select field...</option>
                {fields.map(f => (
                    <option
                        key={f.field}
                        value={f.field}
                        disabled={usedFields.has(f.field)}
                    >
                        {f.label}
                    </option>
                ))}
            </select>

            <br />

            <label>
                Limit:
                <input
                    type="number"
                    value={limit}
                    min={1}
                    max={MAX_LIMIT}
                    onChange={e => setLimit(Math.min(MAX_LIMIT, Math.max(1, Number(e.target.value))))}
                    aria-label="Result limit"
                />
            </label>

            <button onClick={handleApply} disabled={searching}>
                {searching ? 'Searching...' : 'Apply'}
            </button>

            <button onClick={handleReset}>Reset</button>

            {validationError && <p role="alert">{validationError}</p>}
            {searchError && <p role="alert">Search error: {searchError.message}</p>}

            {results && results.rows.length === 0 && <p>No results found.</p>}
            {results && results.rows.length > 0 && <TableView key={resultKey} table={results} searchedFields={activeSearchedFields} />}

            {!results && !searching && !validationError && (
                <p>Configure filters and click Apply to search.</p>
            )}
        </div>
    )
}
