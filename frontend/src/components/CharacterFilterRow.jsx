export function CharacterFilterRow({ filter, fields, usedFields, onChange, onRemove }) {
    const fieldDef = fields.find(f => f.field === filter.field)

    const handleFieldChange = (e) => {
        // Reset all value state when field changes.
        onChange(filter.id, { field: e.target.value, value: '', min: '', max: '', values: [] })
    }

    return (
        <div>
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
                <fieldset>
                    <legend>{fieldDef.label}</legend>
                    {fieldDef.values.map(v => (
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
                            {v}
                        </label>
                    ))}
                </fieldset>
            )}

            {fieldDef && fieldDef.type === 'boolean' && (
                <select
                    value={filter.value}
                    onChange={e => onChange(filter.id, { value: e.target.value })}
                    aria-label={fieldDef.label}
                >
                    <option value="">Select...</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            )}

            <button onClick={() => onRemove(filter.id)}>Remove</button>
        </div>
    )
}
