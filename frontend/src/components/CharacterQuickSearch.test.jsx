import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CharacterQuickSearch } from './CharacterQuickSearch'

vi.mock('../constants/characterQuickSearches', () => ({
    QUICK_SEARCHES: [
        {
            label: 'Test Preset',
            filters: [
                { id: -1, field: 'online', op: 'eq', value: '1', min: '', max: '', values: [] },
            ],
            orderBy: 'level',
            orderDir: 'desc',
            limit: 10,
            visibleCols: ['name', 'level']
        }
    ]
}))

test('renders quick search dropdown', () => {
    render(<CharacterQuickSearch onSelect={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Quick search' })).toBeInTheDocument()
})

test('renders preset options', () => {
    render(<CharacterQuickSearch onSelect={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Test Preset' })).toBeInTheDocument()
})

test('calls onSelect with preset when option selected', () => {
    const onSelect = vi.fn()
    render(<CharacterQuickSearch onSelect={onSelect} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Quick search' }), {
        target: { value: 'Test Preset' }
    })
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
        label: 'Test Preset',
        orderBy: 'level',
        orderDir: 'desc',
        limit: 10,
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
