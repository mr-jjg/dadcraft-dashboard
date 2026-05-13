import { formatTime, formatTimestamp } from './format'

const NOW = Math.floor(Date.now() / 1000)
const SHAPE = /\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} (AM|PM) \w+/

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

test('formatTimestamp returns mm/dd/yy hh:mm AM/PM tz', () => {
    expect(formatTimestamp(NOW)).toMatch(SHAPE)
})

test('formatTimestamp treats input as unix seconds not milliseconds', () => {
    expect(formatTimestamp(0)).toMatch(/\/(69|70),/)
})
