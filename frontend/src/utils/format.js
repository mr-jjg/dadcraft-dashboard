export const formatMoney = (val) => {
    const copper = Number(val)
    const g = Math.floor(copper / 10000)
    const s = Math.floor((copper % 10000) / 100)
    const c = copper % 100
    return `${g}g ${s}s ${c}c`
}

export function formatTime(seconds) {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
}

export function formatTimestamp(unixTs) {
    return new Date(unixTs * 1000).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    })
}
