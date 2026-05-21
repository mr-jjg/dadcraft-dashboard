import { describe, test, expect } from 'vitest'
import { deriveStep, availableSteps, CLEAN_STEPS, TARGET_POINTS } from './metricRange'

const ONE_HOUR = 3600;

describe('deriveStep', () => {
    test('6h window snaps to 15s', () => {
        expect(deriveStep(ONE_HOUR * 6)).toBe(15)
    })

    test('12h window snaps to 15s', () => {
        expect(deriveStep(ONE_HOUR * 12)).toBe(15)
    })

    test('24h window snaps to 30s', () => {
        expect(deriveStep(ONE_HOUR * 24)).toBe(30)
    })

    test('7d window snaps to 300s', () => {
        expect(deriveStep(ONE_HOUR * 24 * 7)).toBe(300)
    })

    test('30d window snaps to 900s', () => {
        expect(deriveStep(ONE_HOUR * 24 * 30)).toBe(900)
    })

    test('90d window snaps to 3600s', () => {
        expect(deriveStep(ONE_HOUR * 24 * 90)).toBe(3600)
    })

    test('very large window clamps to max step', () => {
        expect(deriveStep(ONE_HOUR * 24 * 365)).toBe(CLEAN_STEPS[CLEAN_STEPS.length - 1])
    })
})

describe('deriveStep with irregular window sizes', () => {
    test('non-round window still snaps cleanly', () => {
        // 3h 17m - should snap same as a 3h window
        expect(deriveStep(ONE_HOUR * 3 + 17 * 60)).toBe(15)
    })

    test('window just under a step boundary snaps to same step', () => {
        // just under 12h - 12h / 15 = 2880, exactly at ceiling; just under is still valid at 15s
        expect(deriveStep(ONE_HOUR * 12 - 1)).toBe(15)
    })

    test('window just over a step boundary snaps to next step', () => {
        // just over 12h - 15s would produce >2880 points, snaps to 30s
        expect(deriveStep(ONE_HOUR * 12 + 1)).toBe(30)
    })

    test('single second window snaps to minimum step', () => {
        expect(deriveStep(1)).toBe(15)
    })
})

describe('availableSteps', () => {
    test('6h window includes 15s', () => {
        expect(availableSteps(ONE_HOUR * 6)).toContain(15)
    })

    test('6h window excludes steps that produce too many points', () => {
        // 21600 / 15 = 1440, well under ceiling of 2880 - included
        availableSteps(ONE_HOUR * 6).forEach(s => {
            expect((ONE_HOUR * 6) / s).toBeLessThanOrEqual(TARGET_POINTS)
        })
    })

    test('90d window excludes fine steps', () => {
        const steps = availableSteps(ONE_HOUR * 24 * 90)
        expect(steps).not.toContain(15)
        expect(steps).not.toContain(30)
    })

    test('all returned steps produce at least 60 points', () => {
        const window = ONE_HOUR * 24
        availableSteps(window).forEach(s => {
            expect(window / s).toBeGreaterThanOrEqual(60)
        })
    })

    test('returns empty array for window too small for any step', () => {
        // 10 minutes / 15s = 40 points, below floor of 60
        expect(availableSteps(600)).toEqual([])
    })
})
