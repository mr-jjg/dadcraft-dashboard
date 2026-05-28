import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ProgressionFilters } from './ProgressionFilters'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useTables')

beforeEach(() => {
    useTable.mockReturnValue({ table: null })
})

test('renders filter controls', () => {
    render(<ProgressionFilters onChange={vi.fn()} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByText('Faction')).toBeInTheDocument()
    expect(screen.getByText('Race')).toBeInTheDocument()
    expect(screen.getByText('Class')).toBeInTheDocument()
    expect(screen.getByText('Guild')).toBeInTheDocument()
})

// --- Guild dropdown ---

test('guild dropdown includes Unguilded option', () => {
    render(<ProgressionFilters onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Unguilded' })).toBeInTheDocument()
})

test('guild dropdown renders dynamic guild options from useTable', () => {
    useTable.mockReturnValue({ table: { rows: [['Elwynn Rangers'], ['Defias Brotherhood']] } })
    render(<ProgressionFilters onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Elwynn Rangers' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Defias Brotherhood' })).toBeInTheDocument()
})

test('guild dropdown shows no dynamic options when table is null', () => {
    render(<ProgressionFilters onChange={vi.fn()} />)
    const [, , , guildSelect] = screen.getAllByRole('combobox')
    expect(guildSelect.options).toHaveLength(2)
})

// --- Filter interactions ---

test('faction change resets race', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)
    const [factionSelect, raceSelect] = screen.getAllByRole('combobox')

    fireEvent.change(raceSelect, { target: { value: 'Human' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ race: 'Human' }))

    fireEvent.change(factionSelect, { target: { value: 'horde' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ faction: 'horde', race: '' }))
})

test('faction change clears incompatible class', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)
    const [factionSelect, , classSelect] = screen.getAllByRole('combobox')

    // Paladin is alliance-only
    fireEvent.change(classSelect, { target: { value: 'Paladin' } })
    fireEvent.change(factionSelect, { target: { value: 'horde' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ faction: 'horde', characterClass: '' }))
})

test('faction change preserves compatible class', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)
    const [factionSelect, , classSelect] = screen.getAllByRole('combobox')

    // Warrior exists in both factions
    fireEvent.change(classSelect, { target: { value: 'Warrior' } })
    fireEvent.change(factionSelect, { target: { value: 'horde' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ faction: 'horde', characterClass: 'Warrior' }))
})

test('race change restricts available classes', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)
    const [, raceSelect] = screen.getAllByRole('combobox')

    fireEvent.change(raceSelect, { target: { value: 'Tauren' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ race: 'Tauren' }))
    expect(screen.queryByRole('option', { name: 'Paladin' })).not.toBeInTheDocument()
})

test('class change restricts available races', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)
    const [, , classSelect] = screen.getAllByRole('combobox')

    fireEvent.change(classSelect, { target: { value: 'Druid' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ characterClass: 'Druid' }))
    expect(screen.queryByRole('option', { name: 'Human' })).not.toBeInTheDocument()
})

test('guild filter emits correct value', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)
    const [, , , guildSelect] = screen.getAllByRole('combobox')

    fireEvent.change(guildSelect, { target: { value: 'None' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ guild: 'None' }))
})

test('online filter emits correct value when checked', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ online: 'true' }))
})

test('online filter emits empty string when unchecked', () => {
    const onChange = vi.fn()
    render(<ProgressionFilters onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ online: '' }))
})