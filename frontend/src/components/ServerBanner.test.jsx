import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import { ServerBanner } from './ServerBanner'
import { useMetric } from '../hooks/useMetrics'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useTables')
vi.mock('../hooks/useMetrics')

beforeEach(() => {
    localStorage.clear()
    useMetric.mockReturnValue({ value: 90122, error: null })
    useTable.mockReturnValue({ table: { rows: [['42']] }, error: null })
})

test('renders all stat labels', () => {
    render(<ServerBanner />)
    expect(screen.getByText(/Characters/)).toBeInTheDocument()
    expect(screen.getByText(/Online/)).toBeInTheDocument()
    expect(screen.getByText(/Guilds/)).toBeInTheDocument()
    expect(screen.getByText(/Auctions/)).toBeInTheDocument()
    expect(screen.getByText(/GM Tickets/)).toBeInTheDocument()
    expect(screen.getByText(/System Uptime/)).toBeInTheDocument()
    expect(screen.getByText(/Game Server Uptime/)).toBeInTheDocument()
})

test('renders loading state for table stats', () => {
    useTable.mockReturnValue({ table: null, error: null })
    render(<ServerBanner />)
    expect(screen.getAllByText(/\.\.\./)).toHaveLength(5)
})

test('renders loading state for uptime stats', () => {
    useMetric.mockReturnValue({ value: null, error: null })
    render(<ServerBanner />)
    expect(screen.getAllByText(/\.\.\./)).toHaveLength(2)
})

test('renders error state for table stats', () => {
    useTable.mockReturnValue({ table: null, error: new Error('500') })
    render(<ServerBanner />)
    expect(screen.getAllByText(/Error/)).toHaveLength(5)
})

test('renders error state for uptime stats', () => {
    useMetric.mockReturnValue({ value: null, error: new Error('500') })
    render(<ServerBanner />)
    expect(screen.getAllByText(/Error/)).toHaveLength(2)
})

test('renders formatted uptime values', () => {
    render(<ServerBanner />)
    expect(screen.getAllByText(/01d 01h:02m/)).toHaveLength(2)
})

describe('theme selector', () => {
    test('renders theme select defaulting to azshara', () => {
        render(<ServerBanner />)
        expect(screen.getByRole('combobox', { name: 'Theme' })).toHaveValue('azshara')
    })

    test('reads stored skin from localStorage on mount', () => {
        localStorage.setItem('skin', 'stranglethorn_vale')
        render(<ServerBanner />)
        expect(screen.getByRole('combobox', { name: 'Theme' })).toHaveValue('stranglethorn_vale')
    })

    test('sets data-theme on documentElement when theme changes', () => {
        render(<ServerBanner />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), { target: { value: 'stranglethorn_vale' } })
        expect(document.documentElement.getAttribute('data-theme')).toBe('stranglethorn_vale')
    })

    test('writes selected skin to localStorage', () => {
        render(<ServerBanner />)
        fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), { target: { value: 'stranglethorn_vale' } })
        expect(localStorage.getItem('skin')).toBe('stranglethorn_vale')
    })

    test('defaults to azshara when no skin in localStorage', () => {
        render(<ServerBanner />)
        expect(document.documentElement.getAttribute('data-theme')).toBe('azshara')
    })
})
