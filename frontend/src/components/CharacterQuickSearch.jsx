const QUICK_SEARCHES = [
    {
        label: 'Lifetime Honor Leaders',
        filters: [
            { id: -1, field: 'lifetime_honorable_kills', op: 'range', value: '', min: 1, max: '', values: [] }
        ],
        orderBy: 'lifetime_honorable_kills',
        orderDir: 'desc',
        limit: 20,
        visibleCols: ['name', 'faction', 'race', 'class', 'lifetime_honorable_kills', 'lifetime_honor']
    },
]

export function CharacterQuickSearch({ onSelect }) {
    return (
        <label>
            Quick Search
            <select
                value=""
                onChange={e => {
                    const preset = QUICK_SEARCHES.find(q => q.label === e.target.value)
                    if (preset) onSelect(preset)
                }}
                aria-label="Quick search"
            >
                <option value="">Select...</option>
                {QUICK_SEARCHES.map(q => (
                    <option key={q.label} value={q.label}>{q.label}</option>
                ))}
            </select>
        </label>
    )
}
