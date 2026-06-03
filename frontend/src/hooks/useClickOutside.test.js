import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useRef } from 'react'
import { vi, test, expect } from 'vitest'
import { useClickOutside } from './useClickOutside'

test('calls onClickOutside when click is outside the ref element', () => {
    const onClickOutside = vi.fn()
    const inner = document.createElement('div')
    const outer = document.createElement('div')
    document.body.appendChild(outer)

    const { result } = renderHook(() => {
        const ref = useRef(inner)
        useClickOutside(ref, onClickOutside)
    })

    fireEvent.mouseDown(outer)
    expect(onClickOutside).toHaveBeenCalledTimes(1)

    document.body.removeChild(outer)
})

test('does not call onClickOutside when click is inside the ref element', () => {
    const onClickOutside = vi.fn()
    const inner = document.createElement('div')
    const child = document.createElement('span')
    inner.appendChild(child)
    document.body.appendChild(inner)

    renderHook(() => {
        const ref = useRef(inner)
        useClickOutside(ref, onClickOutside)
    })

    fireEvent.mouseDown(child)
    expect(onClickOutside).not.toHaveBeenCalled()

    document.body.removeChild(inner)
})

test('does not call onClickOutside when ref is null', () => {
    const onClickOutside = vi.fn()

    renderHook(() => {
        const ref = useRef(null)
        useClickOutside(ref, onClickOutside)
    })

    fireEvent.mouseDown(document.body)
    expect(onClickOutside).not.toHaveBeenCalled()
})

test('removes event listener on unmount', () => {
    const onClickOutside = vi.fn()
    const outer = document.createElement('div')
    const inner = document.createElement('div')
    document.body.appendChild(outer)

    const { unmount } = renderHook(() => {
        const ref = useRef(inner)
        useClickOutside(ref, onClickOutside)
    })

    unmount()
    fireEvent.mouseDown(outer)
    expect(onClickOutside).not.toHaveBeenCalled()

    document.body.removeChild(outer)
})
