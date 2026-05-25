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
    test('horizontal open shows up chevron', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveTextContent('▲')
    })

    test('horizontal closed shows down chevron', () => {
        render(<CollapseHandle orientation="horizontal" isOpen={false} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveTextContent('▼')
    })

    test('vertical open shows left chevron', () => {
        render(<CollapseHandle orientation="vertical" isOpen={true} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveTextContent('◀')
    })

    test('vertical closed shows right chevron', () => {
        render(<CollapseHandle orientation="vertical" isOpen={false} onToggle={vi.fn()} />)
        expect(screen.getByRole('button')).toHaveTextContent('▶')
    })
})
