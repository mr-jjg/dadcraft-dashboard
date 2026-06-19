import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, vi, beforeEach } from 'vitest'
import { LeaderboardPanel } from './LeaderboardPanel'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useIsMobile } from '../hooks/useIsMobile'

vi.mock('../hooks/useLeaderboard')
vi.mock('../hooks/useIsMobile')

const mockEntries = [
    { level: 60, name: 'Keekus', race: 'Human',  class: 'Warrior', online: false, ding_time: 0, time_played: 90122 },
    { level: 60, name: 'Joana',  race: 'Troll',   class: 'Hunter',  online: true,  ding_time: 0, time_played: 86400 },
    { level: 60, name: 'Windbiscuit', race: 'Orc', class: 'Shaman', online: false, ding_time: 0, time_played: 80000 },
    { level: 60, name: 'Giddy', race: 'Human',   class: 'Warlock', online: false, ding_time: 0, time_played: 75000 },
]

beforeEach(() => {
    useIsMobile.mockReturnValue(false)
})

describe('loading / error / empty states', () => {
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
})

describe('rendering', () => {
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

    test('formats time_played correctly', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByText('01d 01h:02m:02s')).toBeDefined()
    })

    test('renders online status', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByText('Yes')).toBeDefined()
        expect(screen.getAllByText('No').length).toBeGreaterThan(0)
    })

    test('limits display to 20 entries', () => {
        const manyEntries = Array.from({ length: 25 }, (_, i) => ({
            level: 60, name: `Player${i}`, race: 'Human', class: 'Warrior',
            online: false, ding_time: 0, time_played: 90000 + i
        }))
        useLeaderboard.mockReturnValue({ entries: manyEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getAllByRole('row').length).toBe(21)
    })
})

describe('board filter', () => {
    test('renders board dropdown', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('combobox', { name: 'Board' })).toBeInTheDocument()
    })

    test('selecting speedrun calls useLeaderboard with speedrun', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Board' }), { target: { value: 'speedrun' } })
        expect(useLeaderboard).toHaveBeenCalledWith('speedrun')
    })
})

describe('faction filter', () => {
    test('renders faction dropdown', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('combobox', { name: 'Faction' })).toBeInTheDocument()
    })

    test('filters to alliance entries', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: 'alliance' } })
        expect(screen.getByText('Keekus')).toBeInTheDocument()
        expect(screen.queryByText('Joana')).not.toBeInTheDocument()
    })

    test('filters to horde entries', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: 'horde' } })
        expect(screen.getByText('Joana')).toBeInTheDocument()
        expect(screen.queryByText('Keekus')).not.toBeInTheDocument()
    })
})

describe('class filter', () => {
    test('renders class dropdown', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('combobox', { name: 'Class' })).toBeInTheDocument()
    })

    test('filters to selected class', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), { target: { value: 'Warrior' } })
        expect(screen.getByText('Keekus')).toBeInTheDocument()
        expect(screen.queryByText('Joana')).not.toBeInTheDocument()
    })

    test('faction and class filters combine', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: 'horde' } })
        fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), { target: { value: 'Hunter' } })
        expect(screen.getByText('Joana')).toBeInTheDocument()
        expect(screen.queryByText('Keekus')).not.toBeInTheDocument()
        expect(screen.queryByText('Windbiscuit')).not.toBeInTheDocument()
    })
})

describe('faction change class reset behavior', () => {
    test('clears class when switching to alliance and class is horde-only', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), { target: { value: 'Shaman' } })
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: 'alliance' } })
        expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('')
    })

    test('preserves class when switching factions and class is available for both', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), { target: { value: 'Warlock' } })
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: 'horde' } })
        expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('Warlock')
    })

    test('preserves class when switching back to all factions', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: 'horde' } })
        fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), { target: { value: 'Hunter' } })
        fireEvent.change(screen.getByRole('combobox', { name: 'Faction' }), { target: { value: '' } })
        expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('Hunter')
    })
})

describe('mobile layout', () => {
    test('renders horizontal collapse handle on desktop', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('button', { name: 'Collapse' })).toHaveClass('collapse-handle-horizontal')
    })

    test('renders vertical collapse handle on mobile', () => {
        useIsMobile.mockReturnValue(true)
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('button', { name: 'Collapse' })).toHaveClass('collapse-handle-vertical')
    })

    test('controls are open by default on mobile', () => {
        useIsMobile.mockReturnValue(true)
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('combobox', { name: 'Board' })).toBeInTheDocument()
    })

    test('controls collapse when handle clicked on mobile', () => {
        useIsMobile.mockReturnValue(true)
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByRole('combobox', { name: 'Board' })).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Collapse' }))
        expect(screen.queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument()
    })

    test('table renders in both mobile and desktop layouts', () => {
        useLeaderboard.mockReturnValue({ entries: mockEntries, error: null })
        render(<LeaderboardPanel />)
        expect(screen.getByText('Keekus')).toBeInTheDocument()

        useIsMobile.mockReturnValue(true)
        render(<LeaderboardPanel />)
        expect(screen.getAllByText('Keekus').length).toBe(2)
    })
})
