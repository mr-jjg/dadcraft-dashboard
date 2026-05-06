import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
