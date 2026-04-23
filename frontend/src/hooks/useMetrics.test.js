import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCpu } from './useMetrics'
import { fetchCpu } from '../api/metrics'

vi.mock('../api/metrics')

test('returns value on success', async () => {
    fetchCpu.mockResolvedValue(75.0)

    const { result } = renderHook(() => useCpu())

    await waitFor(() => {
        expect(result.current.value).toBe(75.0)
    })
})

test('returns error on failure', async () => {
    fetchCpu.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useCpu())

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
