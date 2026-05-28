import { snapToPeriodStart, stepPeriod, periodEnd, periodLabel } from './period'

describe('snapToPeriodStart', () => {
    test('1D snaps to midnight of the given date', () => {
        const d = new Date(2026, 4, 11, 14, 30)
        expect(snapToPeriodStart(d, '1D')).toEqual(new Date(2026, 4, 11))
    })

    test('1W snaps to the preceding Sunday', () => {
        const d = new Date(2026, 4, 11) // Monday
        expect(snapToPeriodStart(d, '1W')).toEqual(new Date(2026, 4, 10))
    })

    test('1W snaps to same day when already Sunday', () => {
        const d = new Date(2026, 4, 10)
        expect(snapToPeriodStart(d, '1W')).toEqual(new Date(2026, 4, 10))
    })

    test('1M snaps to first of the month', () => {
        const d = new Date(2026, 4, 11)
        expect(snapToPeriodStart(d, '1M')).toEqual(new Date(2026, 4, 1))
    })

    test('1Y snaps to January 1', () => {
        const d = new Date(2026, 4, 11)
        expect(snapToPeriodStart(d, '1Y')).toEqual(new Date(2026, 0, 1))
    })
})

describe('stepPeriod', () => {
    test('1D steps forward one day', () => {
        const d = new Date(2026, 4, 11)
        expect(stepPeriod(d, '1D', 1)).toEqual(new Date(2026, 4, 12))
    })

    test('1D steps backward one day', () => {
        const d = new Date(2026, 4, 11)
        expect(stepPeriod(d, '1D', -1)).toEqual(new Date(2026, 4, 10))
    })

    test('1D steps backward across month boundary', () => {
        const d = new Date(2026, 4, 1)
        expect(stepPeriod(d, '1D', -1)).toEqual(new Date(2026, 3, 30))
    })

    test('1W steps forward one week', () => {
        const d = new Date(2026, 4, 10) // Sunday May 10
        expect(stepPeriod(d, '1W', 1)).toEqual(new Date(2026, 4, 17))
    })

    test('1M steps forward one month', () => {
        const d = new Date(2026, 4, 1)
        expect(stepPeriod(d, '1M', 1)).toEqual(new Date(2026, 5, 1))
    })

    test('1M steps backward across year boundary', () => {
        const d = new Date(2026, 0, 1)
        expect(stepPeriod(d, '1M', -1)).toEqual(new Date(2025, 11, 1))
    })

    test('1Y steps forward one year', () => {
        const d = new Date(2026, 0, 1)
        expect(stepPeriod(d, '1Y', 1)).toEqual(new Date(2027, 0, 1))
    })
})

describe('periodEnd', () => {
    test('1D is start of next day in unix seconds', () => {
        const d = new Date(2026, 4, 11)
        expect(periodEnd(d, '1D')).toBe(new Date(2026, 4, 12).getTime() / 1000)
    })

    test('1M is first of next month', () => {
        const d = new Date(2026, 4, 1)
        expect(periodEnd(d, '1M')).toBe(new Date(2026, 5, 1).getTime() / 1000)
    })

    test('1Y is Jan 1 of next year', () => {
        const d = new Date(2026, 0, 1)
        expect(periodEnd(d, '1Y')).toBe(new Date(2027, 0, 1).getTime() / 1000)
    })
})

describe('periodLabel', () => {
    test('1D returns mm/dd', () => {
        const d = new Date(2026, 4, 11)
        expect(periodLabel(d, '1D')).toBe('05/11')
    })

    test('1W shows start and end of week', () => {
        const d = new Date(2026, 4, 10) // Sunday May 10
        expect(periodLabel(d, '1W')).toBe('05/10 - 05/16')
    })

    test('1M shows month and year', () => {
        const d = new Date(2026, 4, 1)
        expect(periodLabel(d, '1M')).toBe('May 2026')
    })

    test('1Y shows year only', () => {
        const d = new Date(2026, 0, 1)
        expect(periodLabel(d, '1Y')).toBe('2026')
    })
})
