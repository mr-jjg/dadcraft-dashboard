import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ServerBanner } from './ServerBanner'
import { useMetric } from '../hooks/useMetrics'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useTables')
vi.mock('../hooks/useMetrics')

beforeEach(() => {
    global.ResizeObserver = class {
        observe() {}
        disconnect() {}
    }
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
