import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { TableView } from './TableView'

const SIMPLE_TABLE = {
    columns: ['Name', 'Level'],
    rows: [['Ungagan', '28'], ['Granie', '16'], ['Joana', '9']]
}

test('renders nothing when table is null', () => {
    const { container } = render(<TableView table={null} />)
    expect(container.firstChild).toBeNull()
})

test('renders column headers', () => {
    render(<TableView table={{ columns: ['Name', 'Level', 'Race'], rows: [] }} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Level')).toBeInTheDocument()
    expect(screen.getByText('Race')).toBeInTheDocument()
})

test('renders rows', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    expect(screen.getByText('Ungagan')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('Granie')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
})

test('renders empty tbody when rows is empty', () => {
    render(<TableView table={{ columns: ['Name'], rows: [] }} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.queryAllByRole('row').length).toBe(1) // header row only
})

test('renders each cell in a row', () => {
    render(<TableView table={{
        columns: ['a', 'b', 'c'],
        rows: [['x', 'y', 'z']]
    }} />)
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('y')).toBeInTheDocument()
    expect(screen.getByText('z')).toBeInTheDocument()
})

test('headers are clickable', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Name'))
    expect(screen.getByText('Name ▲')).toBeInTheDocument()
})

test('clicking same header twice reverses sort direction', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    fireEvent.click(screen.getByText('Name'))
    fireEvent.click(screen.getByText('Name ▲'))
    expect(screen.getByText('Name ▼')).toBeInTheDocument()
})

test('sorts string column ascending', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    fireEvent.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Granie')
    expect(rows[2]).toHaveTextContent('Joana')
    expect(rows[3]).toHaveTextContent('Ungagan')
})

test('sorts string column descending', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    fireEvent.click(screen.getByText('Name'))
    fireEvent.click(screen.getByText('Name ▲'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Ungagan')
    expect(rows[2]).toHaveTextContent('Joana')
    expect(rows[3]).toHaveTextContent('Granie')
})

test('sorts numeric column ascending', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    fireEvent.click(screen.getByText('Level'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('9')
    expect(rows[2]).toHaveTextContent('16')
    expect(rows[3]).toHaveTextContent('28')
})

test('sorts numeric column descending', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    fireEvent.click(screen.getByText('Level'))
    fireEvent.click(screen.getByText('Level ▲'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('28')
    expect(rows[2]).toHaveTextContent('16')
    expect(rows[3]).toHaveTextContent('9')
})

test('clicking a different header resets to ascending', () => {
    render(<TableView table={SIMPLE_TABLE} />)
    fireEvent.click(screen.getByText('Name'))
    fireEvent.click(screen.getByText('Name ▲'))
    expect(screen.getByText('Name ▼')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Level'))
    expect(screen.getByText('Level ▲')).toBeInTheDocument()
})

test('does not mutate original rows', () => {
    const table = {
        columns: ['Name', 'Level'],
        rows: [['Ungagan', '28'], ['Granie', '16'], ['Joana', '9']]
    }
    render(<TableView table={table} />)
    fireEvent.click(screen.getByText('Name'))
    expect(table.rows[0][0]).toBe('Ungagan')
})
