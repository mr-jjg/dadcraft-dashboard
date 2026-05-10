import { vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300))
    expect(result.current).toBe('hello')
})

test('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
        initialProps: { value: 'hello' }
    })
    rerender({ value: 'world' })
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('hello')
})

test('updates after delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
        initialProps: { value: 'hello' }
    })
    rerender({ value: 'world' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('world')
})

test('resets timer on rapid changes, settling on final value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
        initialProps: { value: 'a' }
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('c')
})
