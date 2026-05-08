import { mergeByTime } from './chart'

test('merges two series by timestamp', () => {
    const series = [
        { key: 'load1', data: [{ time: 1000, value: 0.5 }, { time: 2000, value: 0.6 }] },
        { key: 'load5', data: [{ time: 1000, value: 0.3 }, { time: 2000, value: 0.4 }] },
    ]
    const result = mergeByTime(series)
    expect(result).toEqual([
        { time: 1000, load1: 0.5, load5: 0.3 },
        { time: 2000, load1: 0.6, load5: 0.4 },
    ])
})

test('sorts by timestamp ascending', () => {
    const series = [
        { key: 'load1', data: [{ time: 2000, value: 0.6 }, { time: 1000, value: 0.5 }] },
    ]
    const result = mergeByTime(series)
    expect(result[0].time).toBe(1000)
    expect(result[1].time).toBe(2000)
})

test('handles empty data gracefully', () => {
    const series = [
        { key: 'load1', data: [] },
        { key: 'load5', data: [] },
    ]
    expect(mergeByTime(series)).toEqual([])
})

test('handles missing timestamps in one series', () => {
    const series = [
        { key: 'load1', data: [{ time: 1000, value: 0.5 }, { time: 2000, value: 0.6 }] },
        { key: 'load5', data: [{ time: 1000, value: 0.3 }] },
    ]
    const result = mergeByTime(series)
    expect(result[0]).toEqual({ time: 1000, load1: 0.5, load5: 0.3 })
    expect(result[1]).toEqual({ time: 2000, load1: 0.6 })
})
