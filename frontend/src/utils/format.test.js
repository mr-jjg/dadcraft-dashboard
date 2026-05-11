import { formatTime, formatDingTime, formatSliderTime, todayString } from './format'

const NOW = Math.floor(Date.now() / 1000)

// formatEfficiency
test('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00d 00h 00m 00s')
})

test('formats exactly one day', () => {
    expect(formatTime(86400)).toBe('01d 00h 00m 00s')
})

test('formats mixed components', () => {
    // 1107283s = 12d 19h 34m 43s
    expect(formatTime(1107283)).toBe('12d 19h 34m 43s')
})

test('pads single-digit values', () => {
    // 1d 1h 2m 2s = 86400 + 3600 + 120 + 2 = 90122
    expect(formatTime(90122)).toBe('01d 01h 02m 02s')
})

// formatDingTime
test('formats unix timestamp as readable date', () => {
    // 1746103600 = some date in 2025; just verify shape
    const result = formatDingTime(1746103600)
    expect(result).toMatch(/[A-Z][a-z]+ \d+, \d{4}/)
})

test('formats epoch zero correctly', () => {
    expect(formatDingTime(0)).toMatch(/[A-Z][a-z]+ \d+, \d{4},? \d+:\d{2} (AM|PM)/)
})

test('formatSliderTime 1D returns time only', () => {
    const result = formatSliderTime(NOW, '1D')
    expect(result).toMatch(/\d+:\d{2} (AM|PM) \w+/)
})

test('formatSliderTime 1W returns date and time', () => {
    const result = formatSliderTime(NOW, '1W')
    expect(result).toMatch(/[A-Z][a-z]+ \d+, \d+:\d{2} (AM|PM) \w+/)
})

test('formatSliderTime 1M returns date without year', () => {
    const result = formatSliderTime(NOW, '1M')
    expect(result).toMatch(/[A-Z][a-z]+ \d+/)
})

test('formatSliderTime 1Y returns date with year', () => {
    const result = formatSliderTime(NOW, '1Y')
    expect(result).toMatch(/[A-Z][a-z]+ \d+, \d{4}/)
})

test('formatSliderTime All returns date with year', () => {
    const result = formatSliderTime(NOW, 'All')
    expect(result).toMatch(/[A-Z][a-z]+ \d+, \d{4}/)
})

test('todayString returns today in YYYY-MM-DD format', () => {
    const result = todayString()
    const today = new Date()
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(result).toBe(expected)
})
