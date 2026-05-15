import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ServerBanner } from './ServerBanner'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useTables')

beforeEach(() => {
    useTable.mockReturnValue({ table: { rows: [['42']] }, error: null })
})

test('renders all stat labels', () => {
    render(<ServerBanner />)
    expect(screen.getByText(/Characters/)).toBeInTheDocument()
    expect(screen.getByText(/Online/)).toBeInTheDocument()
    expect(screen.getByText(/Guilds/)).toBeInTheDocument()
    expect(screen.getByText(/Auctions/)).toBeInTheDocument()
    expect(screen.getByText(/GM Tickets/)).toBeInTheDocument()
})

test('renders loading state', () => {
    useTable.mockReturnValue({ table: null, error: null })
    render(<ServerBanner />)
    expect(screen.getAllByText('...')).toHaveLength(5)
})

test('renders error state', () => {
    useTable.mockReturnValue({ table: null, error: new Error('500') })
    render(<ServerBanner />)
    expect(screen.getAllByText('Error')).toHaveLength(5)
})

test('renders values from table', () => {
    render(<ServerBanner />)
    expect(screen.getAllByText('42')).toHaveLength(5)
})
