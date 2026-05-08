import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProgressionTimestamps } from './useProgressionTimestamps'
import { fetchProgressionTimestamps } from '../api/progressionTimestamps'

vi.mock('../api/progressionTimestamps')

test('returns timestamps on success', async () => {
    fetchProgressionTimestamps.mockResolvedValue([
        { id: 1, scraped_at: 1746103600 },
        { id: 2, scraped_at: 1746107200 },
    ])

    const { result } = renderHook(() => useProgressionTimestamps())

    await waitFor(() => {
        expect(result.current.timestamps).toEqual([
            { id: 1, scraped_at: 1746103600 },
            { id: 2, scraped_at: 1746107200 },
        ])
    })
})

test('returns error on failure', async () => {
    fetchProgressionTimestamps.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useProgressionTimestamps())

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
