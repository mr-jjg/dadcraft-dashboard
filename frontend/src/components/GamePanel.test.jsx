import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { GamePanel } from './GamePanel'
import { useTable } from '../hooks/useTables'

vi.mock('../hooks/useTables')

test('renders loading state', () => {
    useTable.mockReturnValue({ table: null, error: null})

    render(<GamePanel heading="Game" endpoint="api/db/test" />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('renders single column as metric', () => {
    useTable.mockReturnValue({
        table: { columns: ['Count'], rows: [['212']] },
        error: null
    })

    render(<GamePanel heading="Character count" endpoint="/api/db/characters/count" />)

    expect(screen.getByText('Character count: 212')).toBeInTheDocument()
})

test('renders multi column as table', () => {
    useTable.mockReturnValue({
        table: { columns: ['Race', 'Count'], rows: [['Human', '38'], ['Orc', '24']] },
        error: null
    })

    render(<GamePanel heading="Race" endpoint="/api/db/characters/race" />)

    expect(screen.getAllByText('Race').length).toBe(2)
    expect(screen.getByText('Human')).toBeInTheDocument()
    expect(screen.getByText('38')).toBeInTheDocument()
    expect(screen.getByText('Orc')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
})

test('renders error', () => {
    useTable.mockReturnValue({ table: null, error: new Error('500')})

    render(<GamePanel heading="Table" endpoint="api/Table" />)

    expect(screen.getByText('Error: 500')).toBeInTheDocument()
})
