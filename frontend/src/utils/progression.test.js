import { bucketTimestamps, BUCKET_CONFIG, ONE_HOUR, ONE_DAY, ONE_WEEK } from './progression'

function makeTimestamps(count, baseTs = 1746100000) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        scraped_at: baseTs + i * 3600
    }));
}

test('returns empty array for empty input', () => {
    expect(bucketTimestamps([], '1D')).toEqual([])
    expect(bucketTimestamps(null, '1D')).toEqual([])
})

test('returns full array for unknown range', () => {
    const ts = makeTimestamps(5)
    expect(bucketTimestamps(ts, 'unknown')).toEqual(ts)
})

test('1D returns last 24 entries', () => {
    const ts = makeTimestamps(48)
    const result = bucketTimestamps(ts, '1D')
    expect(result.length).toBe(24)
    expect(result[0].id).toBe(25)
    expect(result[23].id).toBe(48)
})

test('1D returns all entries when fewer than 24', () => {
    const ts = makeTimestamps(5)
    const result = bucketTimestamps(ts, '1D')
    expect(result.length).toBe(5)
})

test('1W filters to last 7 days and picks every 6 hours', () => {
    // 14 days of hourly data = 336 entries
    const ts = makeTimestamps(336)
    const result = bucketTimestamps(ts, '1W')
    expect(result.length).toBeLessThanOrEqual(28)
    expect(result.length).toBeGreaterThan(0)
    // verify gap between entries is at least 6 hours
    for (let i = 1; i < result.length; i++) {
        expect(result[i].scraped_at - result[i-1].scraped_at).toBeGreaterThanOrEqual(ONE_HOUR * 6)
    }
})

test('1M picks one per day across last 30 days', () => {
    // 60 days of hourly data
    const ts = makeTimestamps(60 * 24)
    const result = bucketTimestamps(ts, '1M')
    expect(result.length).toBeLessThanOrEqual(30)
    expect(result.length).toBeGreaterThan(0)
    for (let i = 1; i < result.length; i++) {
        expect(result[i].scraped_at - result[i-1].scraped_at).toBeGreaterThanOrEqual(ONE_DAY)
    }
})

test('1Y picks one per week across last 52 weeks', () => {
    // 2 years of hourly data
    const ts = makeTimestamps(2 * 52 * 7 * 24)
    const result = bucketTimestamps(ts, '1Y')
    expect(result.length).toBeLessThanOrEqual(52)
    expect(result.length).toBeGreaterThan(0)
    for (let i = 1; i < result.length; i++) {
        expect(result[i].scraped_at - result[i-1].scraped_at).toBeGreaterThanOrEqual(ONE_WEEK)
    }
})

test('All picks one per week across all data', () => {
    // 4 weeks of hourly data
    const ts = makeTimestamps(4 * 7 * 24)
    const result = bucketTimestamps(ts, 'All')
    expect(result.length).toBe(4)
    for (let i = 1; i < result.length; i++) {
        expect(result[i].scraped_at - result[i-1].scraped_at).toBeGreaterThanOrEqual(ONE_WEEK)
    }
})

test('entries are sorted by scraped_at ascending', () => {
    const ts = makeTimestamps(48)
    const result = bucketTimestamps(ts, '1W')
    for (let i = 1; i < result.length; i++) {
        expect(result[i].scraped_at).toBeGreaterThan(result[i-1].scraped_at)
    }
})

test('BUCKET_CONFIG has expected ranges', () => {
    expect(Object.keys(BUCKET_CONFIG)).toEqual(['1D', '1W', '1M', '1Y', 'All'])
})

test('BUCKET_CONFIG 1W gap is 6 hours', () => {
    expect(BUCKET_CONFIG['1W'].gap).toBe(ONE_HOUR * 6)
})

test('bucketTimestamps uses last timestamp as anchor by default', () => {
    const timestamps = [
        { id: 1, scraped_at: 1000 },
        { id: 2, scraped_at: 4600 },
    ]
    const result = bucketTimestamps(timestamps, '1D')
    expect(result.map(t => t.id)).toContain(2)
})

test('bucketTimestamps uses provided anchor to define window end', () => {
    const anchor = ONE_DAY * 2
    const timestamps = [
        { id: 1, scraped_at: 0 },                      // outside 1D window before anchor
        { id: 2, scraped_at: anchor - ONE_HOUR * 10 }, // inside window
        { id: 3, scraped_at: anchor - ONE_HOUR * 2 },  // inside window
    ]
    const result = bucketTimestamps(timestamps, '1D', anchor)
    const ids = result.map(t => t.id)
    expect(ids).not.toContain(1)
    expect(ids).toContain(3)
    expect(ids).toContain(2)
})
