import { vi } from 'vitest'
import { fetchMetric } from './metrics.js'

test('returns metric value on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 75.0 })
    })

    const result = await fetchMetric('/api/metric')
    expect(result).toBe(75.0)
})

test('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
    })

    await expect(fetchMetric('/api/metric')).rejects.toThrow('500')
})

test('throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    await expect(fetchMetric('/api/metric')).rejects.toThrow('network error')
})

test('fetches from the provided endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 75.0 })
    })

    await fetchMetric('/api/metric')

    expect(global.fetch).toHaveBeenCalledWith('/api/metric')
})
