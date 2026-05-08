import { vi, test, expect } from 'vitest'
import { fetchProgression } from './progression'

test('returns data on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ Labels: { level: '60', class: 'Warrior' }, Value: 2 }])
    })

    const result = await fetchProgression(1777865100, '', '', '', '')
    expect(result).toEqual([{ Labels: { level: '60', class: 'Warrior' }, Value: 2 }])
})

test('throws on error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    await expect(fetchProgression(1777865100, '', '', '', '')).rejects.toThrow('500')
})

test('builds query params correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
    })

    await fetchProgression(1777865100, 'true', 'alliance', '', 'Warrior')

    const url = global.fetch.mock.calls[0][0]
    expect(url).toContain('scrape_id=1777865100')
    expect(url).toContain('online=true')
    expect(url).toContain('faction=alliance')
    expect(url).toContain('class=Warrior')
})

test('omits empty params', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
    })

    await fetchProgression(null, '', '', '', '')

    const url = global.fetch.mock.calls[0][0]
    expect(url).not.toContain('online')
    expect(url).not.toContain('faction')
    expect(url).not.toContain('class')
})
