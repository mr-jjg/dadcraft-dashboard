import { QUICK_SEARCHES } from '../constants/characterQuickSearches'

export function CharacterQuickSearch({ onSelect }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Quick Search:
            <select
                className="order-by-select"
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
