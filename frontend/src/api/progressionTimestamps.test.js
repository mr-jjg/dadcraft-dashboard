import { vi } from 'vitest'
import { fetchProgressionTimestamps } from './progressionTimestamps'

test('returns timestamps on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
            { id: 1, scraped_at: 1746103600 },
            { id: 2, scraped_at: 1746107200 },
        ])
    })

    const result = await fetchProgressionTimestamps()
    expect(result).toEqual([
        { id: 1, scraped_at: 1746103600 },
        { id: 2, scraped_at: 1746107200 },
    ])
})

test('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    await expect(fetchProgressionTimestamps()).rejects.toThrow('500')
})
