import { formatTime, formatDingTime, formatSliderTime } from './format'

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
    expect(formatDingTime(0)).toBe('Jan 1, 1970')
})

test('formatSliderTime 1D returns time only', () => {
    expect(formatSliderTime(0, '1D')).toBe('12:00 AM')
})

test('formatSliderTime 1W returns date and time', () => {
    expect(formatSliderTime(0, '1W')).toBe('Jan 1, 12:00 AM')
})

test('formatSliderTime 1M returns date without year', () => {
    expect(formatSliderTime(0, '1M')).toBe('Jan 1')
})

test('formatSliderTime 1Y returns date with year', () => {
    expect(formatSliderTime(0, '1Y')).toBe('Jan 1, 1970')
})

test('formatSliderTime All returns date with year', () => {
    expect(formatSliderTime(0, 'All')).toBe('Jan 1, 1970')
})
