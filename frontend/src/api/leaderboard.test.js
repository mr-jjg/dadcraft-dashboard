import { vi } from 'vitest'
import { fetchLeaderboard } from './leaderboard'

test('returns entries on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
            { level: 60, name: 'Keekus', race: 'Undead', class: 'Warrior', online: false, ding_time: 1746103600, efficiency: 1107283 }
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
