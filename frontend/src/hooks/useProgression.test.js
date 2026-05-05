import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProgression } from './useProgression'
import { fetchProgression } from '../api/progression'

vi.mock('../api/progression')

test('returns data on success', async () => {
    fetchProgression.mockResolvedValue([
        { Labels: { level: '60', class: 'Warrior' }, Value: 2 }
    ])

    const { result } = renderHook(() => useProgression(1777865100, '', '', '', ''))

    await waitFor(() => {
        expect(result.current.progression).toEqual([
            { Labels: { level: '60', class: 'Warrior' }, Value: 2 }
        ])
    })
})

test('returns error on failure', async () => {
    fetchProgression.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useProgression(1777865100, '', '', '', ''))

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
