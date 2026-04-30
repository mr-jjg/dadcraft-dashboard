import { expect, test, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDistribution } from './useDistributions'
import { fetchDistribution } from '../api/distributions'

vi.mock('../api/distributions')

test('returns distribution on success', async () => {
    fetchDistribution.mockResolvedValue([
        { label: "Human", value: 42 },
        { label: "Orc", value: 38 }
    ])

    const { result } = renderHook(() => useDistribution('api/distribution'))

    await waitFor(() => {
        expect(result.current.distribution).toEqual([
            { label: "Human", value: 42 },
            { label: "Orc", value: 38 }
        ])
    })
})

test('returns error on failure', async () => {
    fetchDistribution.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useDistribution('/api/distribution'))

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
