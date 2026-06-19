import '@testing-library/jest-dom'
import { renderHook, act } from '@testing-library/react'
import { vi, test, expect, beforeEach, afterEach } from 'vitest'
import { useIsMobile } from './useIsMobile'

let mql

beforeEach(() => {
    mql = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }
    window.matchMedia = vi.fn().mockReturnValue(mql)
})

afterEach(() => {
    vi.restoreAllMocks()
})

test('returns false when query does not match on mount', () => {
    mql.matches = false
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
})

test('returns true when query matches on mount', () => {
    mql.matches = true
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
})

test('updates when media query fires a change event', () => {
    mql.matches = false
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    const handler = mql.addEventListener.mock.calls[0][1]
    act(() => handler({ matches: true }))
    expect(result.current).toBe(true)
})

test('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledOnce()
})
