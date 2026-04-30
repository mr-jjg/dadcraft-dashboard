import { expect, vi } from 'vitest'
import { fetchDistribution } from './distributions'

test('returns table values on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
            {"label": "Human"},
            {"value": 42}
        ])
    })

    const result = await fetchDistribution('/api/metric')
    expect(result).toEqual([
            {"label": "Human"},
            {"value": 42}
        ])
})

test('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
    })

    await expect(fetchDistribution('/api/distribution')).rejects.toThrow('500')
})

test('throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    await expect(fetchDistribution('/api/distribution')).rejects.toThrow('network error')
})

test('fetches from the provided endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 75.0 })
    })

    await fetchDistribution('/api/distribution')

    expect(global.fetch).toHaveBeenCalledWith('/api/distribution')
})
