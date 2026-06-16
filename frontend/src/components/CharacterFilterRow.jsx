export function CharacterFilterRow({ filter, fields, usedFields, onChange, onRemove, error }) {
    const fieldDef = fields.find(f => f.field === filter.field)

    const handleFieldChange = (e) => {
        const field = e.target.value
        const def = fields.find(f => f.field === field)
        onChange(filter.id, { field, value: def?.type === 'boolean' ? '1' : '', min: '', max: '', values: [] })
    }

    return (
        <div className={`filter-row${error ? ' filter-row-error' : ''}`}>
            <div className="filter-row-header">
                <button className='btn-remove' onClick={() => onRemove(filter.id)}>✕</button>
                <div className={`filter-field-selector${error ? ' filter-error-wrapper' : ''}`}>
                    <select
                        value={filter.field}
                        onChange={handleFieldChange}
                        aria-label="Select filter field"
                    >
                        <option value="">Select field...</option>
                        {fields.map(f => (
                            <option
                                key={f.field}
                                value={f.field}
                                disabled={usedFields.has(f.field) && f.field !== filter.field}
                            >
                                {f.label}
                            </option>
                        ))}
                    </select>
                    {error && <span className="filter-error-indicator" data-error={error} />}
                </div>
            </div>

            <div className="filter-row-body">
                {fieldDef && fieldDef.type === 'string' && (
                    <input
                        type="text"
                        value={filter.value}
                        maxLength={12}
                        placeholder={`Search ${fieldDef.label}...`}
                        onChange={e => onChange(filter.id, { value: e.target.value })}
                        aria-label={fieldDef.label}
                    />
                )}

                {fieldDef && fieldDef.type === 'string_in' && (
                    [...filter.values, ...(filter.values.length < 10 ? [''] : [])].map((v, i) => (
                        <input
                            key={i}
                            type="text"
                            value={v}
                            placeholder={`${fieldDef.label}...`}
                            onChange={e => {
                                const next = [...filter.values, '']
                                next[i] = e.target.value
                                onChange(filter.id, { values: next.filter(v => v !== '') })
                            }}
                            aria-label={`${fieldDef.label} ${i + 1}`}
                        />
                    ))
                )}

                {fieldDef && fieldDef.type === 'range' && (
                    <>
                        <input
                            type="number"
                            value={filter.min}
                            placeholder="Min"
                            min={fieldDef.min ?? 0}
                            max={fieldDef.max ?? undefined}
                            onChange={e => onChange(filter.id, { min: e.target.value })}
                            aria-label={`${fieldDef.label} min`}
                        />
                        <input
                            type="number"
                            value={filter.max}
                            placeholder="Max"
                            min={fieldDef.min ?? 0}
                            max={fieldDef.max ?? undefined}
                            onChange={e => onChange(filter.id, { max: e.target.value })}
                            aria-label={`${fieldDef.label} max`}
                        />
                    </>
                )}

                {fieldDef && fieldDef.type === 'enum' && (
                    fieldDef.values.map(v => (
                        <label key={v}>
                            <input
                                type="checkbox"
                                checked={filter.values.includes(v)}
                                onChange={e => {
                                    const next = e.target.checked
                                        ? [...filter.values, v]
                                        : filter.values.filter(x => x !== v)
                                    onChange(filter.id, { values: next })
                                }}
                            />
                            <span>{v}</span>
                        </label>
                    ))
                )}

                {fieldDef && fieldDef.type === 'boolean' && (
                    [['1', 'Yes'], ['0', 'No']].map(([val, label]) => (
                        <label key={val}>
                            <input
                                type="radio"
                                name={`boolean-${filter.id}`}
                                value={val}
                                checked={filter.value === val}
                                onChange={() => onChange(filter.id, { value: val })}
                            />
                            <span>{label}</span>
                        </label>
                    ))
                )}
            </div>
        </div>
    )
}
