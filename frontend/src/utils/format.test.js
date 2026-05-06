import { formatEfficiency, formatDingTime } from './format'

// formatEfficiency
test('formats zero seconds', () => {
    expect(formatEfficiency(0)).toBe('00d 00h 00m 00s')
})

test('formats exactly one day', () => {
    expect(formatEfficiency(86400)).toBe('01d 00h 00m 00s')
})

test('formats mixed components', () => {
    // 1107283s = 12d 19h 34m 43s
    expect(formatEfficiency(1107283)).toBe('12d 19h 34m 43s')
})

test('pads single-digit values', () => {
    // 1d 1h 2m 2s = 86400 + 3600 + 120 + 2 = 90122
    expect(formatEfficiency(90122)).toBe('01d 01h 02m 02s')
})

// formatDingTime
test('formats unix timestamp as readable date', () => {
    // 1746103600 = some date in 2025; just verify shape
    const result = formatDingTime(1746103600)
    expect(result).toMatch(/[A-Z][a-z]+ \d+, \d{4}/)
})

test('formats epoch zero correctly', () => {
    expect(formatDingTime(0)).toBe('Jan 1, 1970')
})
