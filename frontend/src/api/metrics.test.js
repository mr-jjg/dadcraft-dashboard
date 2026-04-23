import { vi } from 'vitest'
import { fetchCpu } from './metrics.js'

test('returns cpu value on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 75.0 })
    })

    const result = await fetchCpu()
    expect(result).toBe(75.0)
})

test('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
    })

    await expect(fetchCpu()).rejects.toThrow('500')
})

test('throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    await expect(fetchCpu()).rejects.toThrow('network error')
})
