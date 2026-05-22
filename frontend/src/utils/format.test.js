import { formatMoney, formatTime, formatTimeHM, formatTimestamp, formatAxisTime } from './format'

const NOW = Math.floor(Date.now() / 1000)
const SHAPE = /\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} (AM|PM) \w+/

describe('formatMoney', () => {
    test('converts copper to gold silver copper', () => {
        expect(formatMoney(1089820)).toBe('108g 98s 20c')
    })

    test('handles zero', () => {
        expect(formatMoney(0)).toBe('0g 0s 0c')
    })

    test('handles less than one gold', () => {
        expect(formatMoney(523)).toBe('0g 5s 23c')
    })
})

describe('formatTime', () => {
    test('formats zero seconds', () => {
        expect(formatTime(0)).toBe('00d 00h:00m:00s')
    })

    test('formats exactly one day', () => {
        expect(formatTime(86400)).toBe('01d 00h:00m:00s')
    })

    test('formats mixed components', () => {
        expect(formatTime(1107283)).toBe('12d 19h:34m:43s')
    })

    test('pads single-digit values', () => {
        expect(formatTime(90122)).toBe('01d 01h:02m:02s')
    })
})

describe('formatTimeHM', () => {
    test('formats zero seconds', () => {
        expect(formatTimeHM(0)).toBe('00d 00h:00m')
    })

    test('formats exactly one day', () => {
        expect(formatTimeHM(86400)).toBe('01d 00h:00m')
    })

    test('formats mixed components', () => {
        expect(formatTimeHM(1107283)).toBe('12d 19h:34m')
    })

    test('pads single-digit values', () => {
        expect(formatTimeHM(90122)).toBe('01d 01h:02m')
    })

    test('ignores seconds', () => {
        expect(formatTimeHM(90122)).toBe(formatTimeHM(90122 + 30))
    })
})

describe('formatTimestamp', () => {
    test('returns mm/dd/yy hh:mm AM/PM tz', () => {
        expect(formatTimestamp(NOW)).toMatch(SHAPE)
    })

    test('treats input as unix seconds not milliseconds', () => {
        expect(formatTimestamp(0)).toMatch(/\/(69|70),/)
    })
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
