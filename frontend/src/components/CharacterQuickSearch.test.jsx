import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CharacterQuickSearch } from './CharacterQuickSearch'

test('renders quick search dropdown', () => {
    render(<CharacterQuickSearch onSelect={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Quick search' })).toBeInTheDocument()
})

test('renders preset options', () => {
    render(<CharacterQuickSearch onSelect={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Lifetime Honor Leaders' })).toBeInTheDocument()
})

test('calls onSelect with preset when option selected', () => {
    const onSelect = vi.fn()
    render(<CharacterQuickSearch onSelect={onSelect} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Quick search' }), {
        target: { value: 'Lifetime Honor Leaders' }
    })
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
        label: 'Lifetime Honor Leaders',
        orderBy: 'lifetime_honorable_kills',
        orderDir: 'desc',
        limit: 20,
    }))
})

test('does not call onSelect when empty option selected', () => {
    const onSelect = vi.fn()
    render(<CharacterQuickSearch onSelect={onSelect} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Quick search' }), {
        target: { value: '' }
    })
    expect(onSelect).not.toHaveBeenCalled()
})
