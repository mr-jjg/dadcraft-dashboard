import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLeaderboard } from './useLeaderboard'
import { fetchLeaderboard } from '../api/leaderboard'

vi.mock('../api/leaderboard')

const mockEntries = [
    { level: 60, name: 'Keekus', race: 'Undead', class: 'Warrior', online: false, ding_time: 1746103600, time_played: 1107283 }
]

test('returns entries on success', async () => {
    fetchLeaderboard.mockResolvedValue(mockEntries)

    const { result } = renderHook(() => useLeaderboard())

    await waitFor(() => {
        expect(result.current.entries).toEqual(mockEntries)
    })
})

test('returns error on failure', async () => {
    fetchLeaderboard.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useLeaderboard())

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
