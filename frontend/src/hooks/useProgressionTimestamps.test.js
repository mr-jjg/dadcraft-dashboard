import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProgressionTimestamps } from './useProgressionTimestamps'

test('returns timestamps on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([1777865100, 1777871040])
    })

    const { result } = renderHook(() => useProgressionTimestamps())

    await waitFor(() => {
        expect(result.current.timestamps).toEqual([1777865100, 1777871040])
    })
})

test('returns error on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    const { result } = renderHook(() => useProgressionTimestamps())

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
