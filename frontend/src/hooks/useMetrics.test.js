import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMetric } from './useMetrics'
import { fetchMetric } from '../api/metrics'

vi.mock('../api/metrics')

test('returns value on success', async () => {
    fetchMetric.mockResolvedValue(75.0)

    const { result } = renderHook(() => useMetric('/api/metric'))

    await waitFor(() => {
        expect(result.current.value).toBe(75.0)
    })
})

test('returns error on failure', async () => {
    fetchMetric.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useMetric('/api/metric'))

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
