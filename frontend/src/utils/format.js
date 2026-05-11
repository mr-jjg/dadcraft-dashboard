export function formatTime(seconds) {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
}

export function formatDingTime(unixTs) {
    return new Date(unixTs * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

export function formatSliderTime(unixTs, range) {
    const date = new Date(unixTs * 1000)
    if (range === '1D') {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
        })
    }
    if (range === '1W') {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
        })
    }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: range === '1Y' || range === 'All' ? 'numeric' : undefined,
    })
}

export function todayString() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}
