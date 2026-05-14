import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMetricRange } from './useMetricRange'
import { fetchMetricRange } from '../api/metricRange'

vi.mock('../api/metricRange')

test('returns data on success', async () => {
    fetchMetricRange.mockResolvedValue([
        { time: 1, value: 4127.0546875 },
        { time: 2, value: 4161.3046875 },
        { time: 3, value: 4216.4296875 }
    ])

    const { result } = renderHook(() => useMetricRange('/api/metric/range'))

    await waitFor(() => {
        expect(result.current.data).toEqual([
            { time: 1, value: 4127.0546875 },
            { time: 2, value: 4161.3046875 },
            { time: 3, value: 4216.4296875 }
        ])
    })
})

test('returns error on failure', async () => {
    fetchMetricRange.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useMetricRange('/api/metric/range'))

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})

test('passes params to fetchMetricRange', async () => {
    fetchMetricRange.mockResolvedValue([])

    renderHook(() => useMetricRange('/api/metric/range', { start: 1000, end: 2000, step: 60 }))

    await waitFor(() => {
        expect(fetchMetricRange).toHaveBeenCalledWith('/api/metric/range', { start: 1000, end: 2000, step: 60 })
    })
})

test('refetches when params change', async () => {
    fetchMetricRange.mockResolvedValue([{ time: 1, value: 1.0 }])

    const { rerender, result } = renderHook(
        ({ params }) => useMetricRange('/api/metric/range', params),
        { initialProps: { params: { start: 1000, end: 2000, step: 60 } } }
    )

    await waitFor(() => expect(result.current.data).toEqual([{ time: 1, value: 1.0 }]))

    fetchMetricRange.mockResolvedValue([{ time: 2, value: 2.0 }])

    rerender({ params: { start: 3000, end: 4000, step: 60 } })

    await waitFor(() => expect(result.current.data).toEqual([{ time: 2, value: 2.0 }]))
})
