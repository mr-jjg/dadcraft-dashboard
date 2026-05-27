import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
    let handler

    beforeEach(() => {
        handler = null
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            addEventListener: vi.fn((_, h) => { handler = h }),
            removeEventListener: vi.fn(),
        }))
    })

    test('returns false when query does not match', () => {
        const { result } = renderHook(() => useMediaQuery('(max-width: 896px)'))
        expect(result.current).toBe(false)
    })

    test('returns true when query matches', () => {
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: true,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
        const { result } = renderHook(() => useMediaQuery('(max-width: 896px)'))
        expect(result.current).toBe(true)
    })

    test('adds event listener on mount', () => {
        const addEventListener = vi.fn()
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            addEventListener,
            removeEventListener: vi.fn(),
        }))
        renderHook(() => useMediaQuery('(max-width: 896px)'))
        expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    test('removes event listener on unmount', () => {
        const removeEventListener = vi.fn()
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener,
        }))
        const { unmount } = renderHook(() => useMediaQuery('(max-width: 896px)'))
        unmount()
        expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    test('updates when handler fires', () => {
        const { result } = renderHook(() => useMediaQuery('(max-width: 896px)'))
        expect(result.current).toBe(false)
        act(() => handler({ matches: true }))
        expect(result.current).toBe(true)
    })
})
