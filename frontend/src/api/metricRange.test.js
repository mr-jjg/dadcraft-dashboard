import { vi } from 'vitest'
import { fetchMetricRange } from './metricRange'

test('returns metric range data on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
            [1, 4127.0546875],
            [2, 4161.3046875],
            [3, 4216.4296875]
        ])
    })

    const result = await fetchMetricRange('/api/metric/range')
    expect(result).toEqual([
        { time: 1, value: 4127.0546875 },
        { time: 2, value: 4161.3046875 },
        { time: 3, value: 4216.4296875 }
    ])
})

test('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
    })

    await expect(fetchMetricRange('/api/metric/range')).rejects.toThrow('500')
})

test('throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    await expect(fetchMetricRange('/api/metric/range')).rejects.toThrow('network error')
})

test('fetches from the provided endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
            [1, 4127.0546875],
            [2, 4161.3046875],
            [3, 4216.4296875]
        ])
    })

    await fetchMetricRange('/api/metric/range')

    expect(global.fetch).toHaveBeenCalledWith('/api/metric/range')
})
