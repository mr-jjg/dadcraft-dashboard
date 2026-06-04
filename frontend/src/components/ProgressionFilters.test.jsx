import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { vi } from 'vitest'
import { ProgressionFilters } from './ProgressionFilters'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useTables')

const DEFAULT_FILTERS = { online: '', faction: '', race: '', characterClass: '', guild: '' }

beforeEach(() => {
    useTable.mockReturnValue({ table: null })
})

function FilterWrapper({ onChange }) {
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const handleChange = (next) => { setFilters(next); onChange(next) }
    return <ProgressionFilters filters={filters} onChange={handleChange} />
}

const onlineSelect  = () => screen.getByRole('combobox', { name: 'Online filter' })
const factionSelect = () => screen.getByRole('combobox', { name: 'Faction filter' })
const raceSelect    = () => screen.getByRole('combobox', { name: 'Race filter' })
const classSelect   = () => screen.getByRole('combobox', { name: 'Class filter' })
const guildSelect   = () => screen.getByRole('combobox', { name: 'Guild filter' })

test('renders filter controls', () => {
    render(<ProgressionFilters filters={DEFAULT_FILTERS} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Online filter' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Faction filter' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Race filter' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Class filter' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Guild filter' })).toBeInTheDocument()
})

// --- Guild dropdown ---

test('guild dropdown includes Unguilded option', () => {
    render(<ProgressionFilters filters={DEFAULT_FILTERS} onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Unguilded' })).toBeInTheDocument()
})

test('guild dropdown renders dynamic guild options from useTable', () => {
    useTable.mockReturnValue({ table: { rows: [['Elwynn Rangers'], ['Defias Brotherhood']] } })
    render(<ProgressionFilters filters={DEFAULT_FILTERS} onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Elwynn Rangers' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Defias Brotherhood' })).toBeInTheDocument()
})

test('guild dropdown shows no dynamic options when table is null', () => {
    render(<ProgressionFilters filters={DEFAULT_FILTERS} onChange={vi.fn()} />)
    expect(guildSelect().options).toHaveLength(2)
})

// --- Filter interactions ---

test('faction change resets race', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(raceSelect(), { target: { value: 'Human' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ race: 'Human' }))

    fireEvent.change(factionSelect(), { target: { value: 'horde' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ faction: 'horde', race: '' }))
})

test('faction change clears incompatible class', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(classSelect(), { target: { value: 'Paladin' } })
    fireEvent.change(factionSelect(), { target: { value: 'horde' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ faction: 'horde', characterClass: '' }))
})

test('faction change preserves compatible class', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(classSelect(), { target: { value: 'Warrior' } })
    fireEvent.change(factionSelect(), { target: { value: 'horde' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ faction: 'horde', characterClass: 'Warrior' }))
})

test('race change restricts available classes', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(raceSelect(), { target: { value: 'Tauren' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ race: 'Tauren' }))
    expect(screen.queryByRole('option', { name: 'Paladin' })).not.toBeInTheDocument()
})

test('class change restricts available races', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(classSelect(), { target: { value: 'Druid' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ characterClass: 'Druid' }))
    expect(screen.queryByRole('option', { name: 'Human' })).not.toBeInTheDocument()
})

test('guild filter emits correct value', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(guildSelect(), { target: { value: 'None' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ guild: 'None' }))
})

test('online filter emits online value', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(onlineSelect(), { target: { value: 'true' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ online: 'true' }))
})

test('online filter emits offline value', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(onlineSelect(), { target: { value: 'false' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ online: 'false' }))
})

test('online filter emits empty string for All', () => {
    const onChange = vi.fn()
    render(<FilterWrapper onChange={onChange} />)

    fireEvent.change(onlineSelect(), { target: { value: 'true' } })
    fireEvent.change(onlineSelect(), { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ online: '' }))
})
