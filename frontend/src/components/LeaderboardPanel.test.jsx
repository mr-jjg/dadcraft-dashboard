import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { LeaderboardPanel } from './LeaderboardPanel'
import { useLeaderboard } from '../hooks/useLeaderboard'

vi.mock('../hooks/useLeaderboard')

const mockEntries = [
    { level: 60, name: 'Keekus', race: 'Human', class: 'Warrior', online: false, ding_time: 0, efficiency: 90122 },
    { level: 60, name: 'Joana',  race: 'Troll',  class: 'Hunter',  online: true,  ding_time: 0, efficiency: 86400 },
]

test('renders loading state', () => {
    useLeaderboard.mockReturnValue({ entries: null, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('Loading...')).toBeDefined()
})

test('renders error state', () => {
    useLeaderboard.mockReturnValue({ entries: null, error: new Error('500') })
    render(<LeaderboardPanel />)
    expect(screen.getByText(/Error/)).toBeDefined()
})

test('renders empty state', () => {
    useLeaderboard.mockReturnValue({ entries: [], error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('No leaderboard data yet.')).toBeDefined()
})

test('renders leaderboard entries', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('Keekus')).toBeDefined()
    expect(screen.getByText('Joana')).toBeDefined()
})

test('renders rank numbers', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
})

test('formats efficiency correctly', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('01d 01h 02m 02s')).toBeDefined()
})

test('renders online status', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('Yes')).toBeDefined()
    expect(screen.getByText('No')).toBeDefined()
})

test('renders faction dropdown', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getByText('Faction')).toBeInTheDocument()
})

test('filters to alliance entries', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'alliance' } })
    expect(screen.getByText('Keekus')).toBeInTheDocument()
    expect(screen.queryByText('Joana')).not.toBeInTheDocument()
})

test('filters to horde entries', () => {
    useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
    render(<LeaderboardPanel />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'horde' } })
    expect(screen.getByText('Joana')).toBeInTheDocument()
    expect(screen.queryByText('Keekus')).not.toBeInTheDocument()
})

test('limits display to 20 entries', () => {
    const manyEntries = Array.from({ length: 25 }, (_, i) => ({
        level: 60, name: `Player${i}`, race: 'Human', class: 'Warrior',
        online: false, ding_time: 0, efficiency: 90000 + i
    }))
    useLeaderboard.mockReturnValue({ entries: manyEntries, error: null })
    render(<LeaderboardPanel />)
    expect(screen.getAllByRole('row').length).toBe(21) // 20 data rows + 1 header
})
