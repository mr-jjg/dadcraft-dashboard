const CHEVRONS = {
    horizontal: { open: '\u25B2\uFE0E', closed: '\u25BC\uFE0E' },
    vertical:   { open: '\u25C0\uFE0E', closed: '\u25B6\uFE0E' },
}

export function CollapseHandle({ orientation, isOpen, onToggle }) {
    const chevron = CHEVRONS[orientation][isOpen ? 'open' : 'closed']

    return (
        <div
            className={`collapse-handle collapse-handle-${orientation}`}
            onClick={onToggle}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggle()
                }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
            <span className="collapse-handle-chevron">{chevron}</span>
        </div>
    )
}
