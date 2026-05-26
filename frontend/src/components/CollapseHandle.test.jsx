import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { CollapseHandle } from './CollapseHandle'

describe('accessibility', () => {
    test('has button role', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    test('is focusable', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
    })

    test('aria-expanded is true when open', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    })

    test('aria-expanded is false when closed', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={false} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    })

    test('aria-label is Collapse when open', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument()
    })

    test('aria-label is Expand when closed', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={false} onToggle={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument()
    })
})

describe('interaction', () => {
    test('calls onToggle on click', () => {
        const onToggle = vi.fn()
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={onToggle} />)
        fireEvent.click(screen.getByRole('button'))
        expect(onToggle).toHaveBeenCalledOnce()
    })

    test('calls onToggle on Enter key', () => {
        const onToggle = vi.fn()
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={onToggle} />)
        fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
        expect(onToggle).toHaveBeenCalledOnce()
    })

    test('calls onToggle on Space key', () => {
        const onToggle = vi.fn()
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={onToggle} />)
        fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
        expect(onToggle).toHaveBeenCalledOnce()
    })

    test('does not call onToggle on other keys', () => {
        const onToggle = vi.fn()
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={onToggle} />)
        fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' })
        expect(onToggle).not.toHaveBeenCalled()
    })
})

describe('orientation classes', () => {
    test('applies horizontal class', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveClass('collapse-handle-horizontal')
    })

    test('applies vertical class', () => {
        render(<CollapseHandle orientation="vertical" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveClass('collapse-handle-vertical')
    })

    test('always applies base class', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveClass('collapse-handle')
    })
})

describe('chevron', () => {
    test('horizontal open shows up triangle', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(document.querySelector('path')).toHaveAttribute('d', 'M4 10 L8 5 L12 10 Z')
    })

    test('horizontal closed shows down triangle', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={false} onToggle={vi.fn()} />)
        expect(document.querySelector('path')).toHaveAttribute('d', 'M4 6 L8 11 L12 6 Z')
    })

    test('vertical open shows left triangle', () => {
        render(<CollapseHandle orientation="vertical" isOpen={true} onToggle={vi.fn()} />)
        expect(document.querySelector('path')).toHaveAttribute('d', 'M10 4 L5 8 L10 12 Z')
    })

    test('vertical closed shows right triangle', () => {
        render(<CollapseHandle orientation="vertical" isOpen={false} onToggle={vi.fn()} />)
        expect(document.querySelector('path')).toHaveAttribute('d', 'M6 4 L11 8 L6 12 Z')
    })
})
