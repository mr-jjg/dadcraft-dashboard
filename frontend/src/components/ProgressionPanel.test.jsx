import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import { ProgressionPanel } from './ProgressionPanel'
import { formatSliderTime } from '../utils/format'
import { useProgression } from '../hooks/useProgression'
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useProgression')
vi.mock('../hooks/useProgressionTimestamps')
vi.mock('../hooks/useTables')

const NOW = Math.floor(Date.now() / 1000)
const ONE_TIMESTAMP  = [{ id: 1, scraped_at: NOW - 3600 }]
const TWO_TIMESTAMPS = [{ id: 1, scraped_at: NOW - 7200 }, { id: 2, scraped_at: NOW - 3600 }]

beforeEach(() => {
    useProgression.mockReturnValue({ progression: null, error: null })
    useProgressionTimestamps.mockReturnValue({ timestamps: ONE_TIMESTAMP })
    useTable.mockReturnValue({ table: null })
})

// --- Rendering ---

test('renders heading', () => {
    render(<ProgressionPanel />)
    expect(screen.getByText('Population Progression')).toBeInTheDocument()
})

test('renders error message on progression error', () => {
    useProgression.mockReturnValue({ progression: null, error: new Error('500') })
    render(<ProgressionPanel />)
    expect(screen.getByText('Error loading progression data')).toBeInTheDocument()
})

test('renders filter controls', () => {
    render(<ProgressionPanel />)
    expect(screen.getByText('Online only')).toBeInTheDocument()
    expect(screen.getByText('Faction')).toBeInTheDocument()
    expect(screen.getByText('Race')).toBeInTheDocument()
    expect(screen.getByText('Class')).toBeInTheDocument()
    expect(screen.getByText('Guild')).toBeInTheDocument()
})

// --- Range buttons ---

test('1D range button always renders', () => {
    render(<ProgressionPanel />)
    expect(screen.getByRole('button', { name: '1D' })).toBeInTheDocument()
})

test('1D range button is disabled by default', () => {
    render(<ProgressionPanel />)
    expect(screen.getByRole('button', { name: '1D' })).toBeDisabled()
})

test('other range buttons hidden when insufficient data', () => {
    render(<ProgressionPanel />)
    expect(screen.queryByRole('button', { name: '1W' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1M' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1Y' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
})

// --- Slider ---

test('slider hidden when one timestamp', () => {
    render(<ProgressionPanel />)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
})

test('slider visible when multiple timestamps', () => {
    useProgressionTimestamps.mockReturnValue({ timestamps: TWO_TIMESTAMPS })
    render(<ProgressionPanel />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
})

test('slider displays formatted timestamp of selected entry', () => {
    vi.useFakeTimers()
    useProgressionTimestamps.mockReturnValue({ timestamps: TWO_TIMESTAMPS })
    render(<ProgressionPanel />)
    act(() => vi.advanceTimersByTime(300))
    const expected = formatSliderTime(TWO_TIMESTAMPS[1].scraped_at, '1D')
    expect(screen.getByText(expected)).toBeInTheDocument()
    vi.useRealTimers()
})

test('date picker renders by default', () => {
    const { container } = render(<ProgressionPanel />)
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument()
})

test('date picker defaults to today', () => {
    const { container } = render(<ProgressionPanel />)
    const today = new Date()
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(container.querySelector('input[type="date"]').value).toBe(expected)
})

test('date picker max is today', () => {
    const { container } = render(<ProgressionPanel />)
    const today = new Date()
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(container.querySelector('input[type="date"]').max).toBe(expected)
})

// --- Guild dropdown ---

test('guild dropdown includes Unguilded option', () => {
    render(<ProgressionPanel />)
    expect(screen.getByRole('option', { name: 'Unguilded' })).toBeInTheDocument()
})

test('guild dropdown renders dynamic guild options from useTable', () => {
    useTable.mockReturnValue({ table: { rows: [['Elwynn Rangers'], ['Defias Brotherhood']] } })
    render(<ProgressionPanel />)
    expect(screen.getByRole('option', { name: 'Elwynn Rangers' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Defias Brotherhood' })).toBeInTheDocument()
})

test('guild dropdown shows no dynamic options when table is null', () => {
    render(<ProgressionPanel />)
    // only All and Unguilded
    const [, , , guildSelect] = screen.getAllByRole('combobox')
    expect(guildSelect.options).toHaveLength(2)
})

// --- Filter interactions ---

test('faction change resets race', () => {
    render(<ProgressionPanel />)
    const [factionSelect, raceSelect] = screen.getAllByRole('combobox')

    fireEvent.change(raceSelect, { target: { value: 'Human' } })
    expect(useProgression).toHaveBeenLastCalledWith(expect.anything(), '', '', 'Human', '', '')

    fireEvent.change(factionSelect, { target: { value: 'horde' } })
    expect(useProgression).toHaveBeenLastCalledWith(expect.anything(), '', 'horde', '', '', '')
})

test('faction change clears incompatible class', () => {
    render(<ProgressionPanel />)
    const [factionSelect, , classSelect] = screen.getAllByRole('combobox')

    // Paladin is alliance-only
    fireEvent.change(classSelect, { target: { value: 'Paladin' } })
    fireEvent.change(factionSelect, { target: { value: 'horde' } })
    expect(useProgression).toHaveBeenLastCalledWith(expect.anything(), '', 'horde', '', '', '')
})

test('faction change preserves compatible class', () => {
    render(<ProgressionPanel />)
    const [factionSelect, , classSelect] = screen.getAllByRole('combobox')

    // Warrior exists in both factions
    fireEvent.change(classSelect, { target: { value: 'Warrior' } })
    fireEvent.change(factionSelect, { target: { value: 'horde' } })
    expect(useProgression).toHaveBeenLastCalledWith(expect.anything(), '', 'horde', '', 'Warrior', '')
})

test('guild filter passed to useProgression', () => {
    render(<ProgressionPanel />)
    const [, , , guildSelect] = screen.getAllByRole('combobox')

    fireEvent.change(guildSelect, { target: { value: 'None' } })
    expect(useProgression).toHaveBeenLastCalledWith(expect.anything(), '', '', '', '', 'None')
})
