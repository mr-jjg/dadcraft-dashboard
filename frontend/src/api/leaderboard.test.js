import { vi } from 'vitest'
import { fetchLeaderboard } from './leaderboard'

test('returns entries on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
            { level: 60, name: 'Keekus', race: 'Undead', class: 'Warrior', online: false, ding_time: 1746103600, time_played: 1107283 }
        ])
    })

    const result = await fetchLeaderboard()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Keekus')
})

test('throws on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchLeaderboard()).rejects.toThrow('500')
})

test('fetches without query string when no sort provided', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
    })

    await fetchLeaderboard()

    expect(global.fetch).toHaveBeenCalledWith('/api/leaderboard')
})

test('appends sort as query string when provided', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
    })

    await fetchLeaderboard('speedrun')

    expect(global.fetch).toHaveBeenCalledWith('/api/leaderboard?sort=speedrun')
})
