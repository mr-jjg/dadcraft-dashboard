import { renderHook, act, waitFor } from '@testing-library/react'
import { expect, test, vi, beforeEach, describe } from 'vitest'
import { useChartData } from './useChartData'
import * as metricRangeApi from '../api/metricRange'

vi.mock('../api/metricRange')

const LINES = [
    { key: 'load1', endpoint: '/api/system/load1/range', color: '#8884d8' },
    { key: 'load5', endpoint: '/api/system/load5/range', color: '#82ca9d' },
]

const MOCK_DATA_L1 = [
    { time: 1000, value: 0.42 },
    { time: 2000, value: 0.38 },
]

const MOCK_DATA_L5 = [
    { time: 1000, value: 0.61 },
    { time: 2000, value: 0.59 },
]

const MERGED = [
    { time: 1000, load1: 0.42, load5: 0.61 },
    { time: 2000, load1: 0.38, load5: 0.59 },
]

beforeEach(() => {
    vi.clearAllMocks()
    metricRangeApi.fetchMetricRange
        .mockResolvedValueOnce(MOCK_DATA_L1)
        .mockResolvedValueOnce(MOCK_DATA_L5)
        .mockResolvedValueOnce(MOCK_DATA_L1)
        .mockResolvedValueOnce(MOCK_DATA_L5)
})

describe('initial fetch', () => {
    test('overviewData populated on mount', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))
    })

    test('detailData populated on mount', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.detailData).toEqual(MERGED))
    })

    test('no errors on successful fetch', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))
        expect(result.current.overviewError).toBeNull()
        expect(result.current.detailError).toBeNull()
    })

    test('empty lines produces empty data', async () => {
        const { result } = renderHook(() => useChartData([]))
        await waitFor(() => {
            expect(result.current.overviewData).toEqual([])
            expect(result.current.detailData).toEqual([])
        })
    })
})

describe('error handling', () => {
    test('overviewError set on fetch failure', async () => {
        metricRangeApi.fetchMetricRange.mockReset()
        metricRangeApi.fetchMetricRange.mockRejectedValue(new Error('500'))
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewError).toBeInstanceOf(Error))
    })
})

describe('onBrushChange', () => {
    test('does not fetch before debounce settles', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))

        const callCountBefore = metricRangeApi.fetchMetricRange.mock.calls.length

        vi.useFakeTimers()
        act(() => { result.current.onBrushChange({ startIndex: 0, endIndex: 1 }) })
        expect(metricRangeApi.fetchMetricRange.mock.calls.length).toBe(callCountBefore)
        vi.useRealTimers()
    })

    test('fetches after debounce settles', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))

        metricRangeApi.fetchMetricRange
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)

        vi.useFakeTimers()
        act(() => {
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(500)
        })
        vi.useRealTimers()

        await waitFor(() => {
            expect(metricRangeApi.fetchMetricRange.mock.calls.length).toBeGreaterThan(4)
        })
    })

    test('rapid brush changes only trigger one fetch', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))

        const callCountBefore = metricRangeApi.fetchMetricRange.mock.calls.length

        metricRangeApi.fetchMetricRange
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)

        vi.useFakeTimers()
        act(() => {
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(100)
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(100)
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(500)
        })
        vi.useRealTimers()

        await waitFor(() => {
            const newCalls = metricRangeApi.fetchMetricRange.mock.calls.length - callCountBefore
            expect(newCalls).toBe(LINES.length)
        })
    })

    test('windowSeconds updates after brush settles', async () => {
        const { result } = renderHook(() => useChartData(LINES))
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))

        metricRangeApi.fetchMetricRange
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)

        vi.useFakeTimers()
        act(() => {
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(500)
        })
        vi.useRealTimers()

        await waitFor(() => {
            expect(result.current.windowSeconds).toBe(MERGED[1].time - MERGED[0].time)
        })
    })
})

describe('tile swap', () => {
    test('windowSeconds preserved when lines change', async () => {
        const { result, rerender } = renderHook(
            ({ lines }) => useChartData(lines),
            { initialProps: { lines: LINES } }
        )
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))

        metricRangeApi.fetchMetricRange
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)

        vi.useFakeTimers()
        act(() => {
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(500)
        })
        vi.useRealTimers()

        await waitFor(() => expect(result.current.windowSeconds).toBe(
            MERGED[1].time - MERGED[0].time
        ))

        const windowBefore = result.current.windowSeconds

        metricRangeApi.fetchMetricRange
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)

        rerender({ lines: [{ key: 'cpu', endpoint: '/api/system/cpu/range', color: '#ff7300' }] })

        await waitFor(() => expect(result.current.windowSeconds).toBe(windowBefore))
    })

    test('brushKey increments when lines change with valid brushWindow', async () => {
        const { result, rerender } = renderHook(
            ({ lines }) => useChartData(lines),
            { initialProps: { lines: LINES } }
        )
        await waitFor(() => expect(result.current.overviewData).toEqual(MERGED))

        vi.useFakeTimers()
        act(() => {
            result.current.onBrushChange({ startIndex: 0, endIndex: 1 })
            vi.advanceTimersByTime(500)
        })
        vi.useRealTimers()

        await waitFor(() => expect(result.current.windowSeconds).toBe(
            MERGED[1].time - MERGED[0].time
        ))

        const keyBefore = result.current.brushKey

        metricRangeApi.fetchMetricRange
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)
            .mockResolvedValueOnce(MOCK_DATA_L1)
            .mockResolvedValueOnce(MOCK_DATA_L5)

        rerender({ lines: [{ key: 'cpu', endpoint: '/api/system/cpu/range', color: '#ff7300' }] })

        await waitFor(() => expect(result.current.brushKey).toBeGreaterThan(keyBefore))
    })
})

describe('stepOverride', () => {
    test('uses stepOverride instead of deriveStep when provided', async () => {
        const { result } = renderHook(() => useChartData(LINES, 90 * 24 * 3600, 120))
        await waitFor(() => expect(result.current.detailData).toEqual(MERGED))

        const calls = metricRangeApi.fetchMetricRange.mock.calls
        const detailCall = calls.find(([, params]) => params.step === 120)
        expect(detailCall).toBeDefined()
    })
})
