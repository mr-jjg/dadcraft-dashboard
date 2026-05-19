import { formatMoney, formatTime, formatTimestamp, formatAxisTime } from './format'

const NOW = Math.floor(Date.now() / 1000)
const SHAPE = /\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} (AM|PM) \w+/

test('formatMoney converts copper to gold silver copper', () => {
    expect(formatMoney(1089820)).toBe('108g 98s 20c')
})

test('formatMoney handles zero', () => {
    expect(formatMoney(0)).toBe('0g 0s 0c')
})

test('formatMoney handles less than one gold', () => {
    expect(formatMoney(523)).toBe('0g 5s 23c')
})

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

describe('formatAxisTime', () => {
    test('returns MM/DD HH:mm format', () => {
        const ts = new Date('2026-05-15T19:21:00').getTime() / 1000
        expect(formatAxisTime(ts)).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/)
    })

    test('pads single-digit month and day', () => {
        const ts = new Date('2026-01-05T08:03:00').getTime() / 1000
        expect(formatAxisTime(ts)).toMatch(/^01\/05 08:03$/)
    })

    test('pads single-digit hour and minute', () => {
        const ts = new Date('2026-05-15T09:04:00').getTime() / 1000
        expect(formatAxisTime(ts)).toMatch(/^05\/15 09:04$/)
    })
})
