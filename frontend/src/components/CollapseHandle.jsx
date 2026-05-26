const PATHS = {
    up:    'M4 10 L8 5 L12 10 Z',
    down:  'M4 6 L8 11 L12 6 Z',
    left:  'M10 4 L5 8 L10 12 Z',
    right: 'M6 4 L11 8 L6 12 Z',
}

function ChevronBadge({ direction }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="collapse-handle-chevron"
        >
            <circle
                cx="8"
                cy="8"
                r="7"
                fill="rgba(180,120,140,0.9)"
                stroke="rgba(180,120,140,0.4)"
                strokeWidth="1"
            />
            <path d={PATHS[direction]} fill="rgba(20,10,18,0.85)" />
        </svg>
    )
}

const DIRECTIONS = {
    horizontal: { open: 'up',   closed: 'down'  },
    vertical:   { open: 'left', closed: 'right' },
}

export function CollapseHandle({ orientation, isOpen, onToggle }) {
    const direction = DIRECTIONS[orientation][isOpen ? 'open' : 'closed']

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
            <ChevronBadge direction={direction} />
        </div>
    )
}
