import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { TableView } from './TableView'

const SIMPLE_TABLE = {
    columns: ['Name', 'Level'],
    rows: [['Ungagan', '28'], ['Granie', '16'], ['Joana', '9']]
}

const LARGE_TABLE = {
    columns: ['Name', 'Level'],
    rows: Array.from({ length: 30 }, (_, i) => [`Player${i}`, `${i + 1}`])
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

test('renders mapped column label when available', () => {
    render(<TableView table={{ columns: ['in_battleground'], rows: [] }} />)
    expect(screen.getByText('In BG')).toBeInTheDocument()
})

test('renders raw column name when no mapping exists', () => {
    render(<TableView table={{ columns: ['custom_column'], rows: [] }} />)
    expect(screen.getByText('custom_column')).toBeInTheDocument()
})

test('formats money column as gold silver copper', () => {
    render(<TableView table={{ columns: ['money'], rows: [['1089820']] }} />)
    expect(screen.getByText('108g 98s 20c')).toBeInTheDocument()
})

test('formats totaltime column as days hours minutes seconds', () => {
    render(<TableView table={{ columns: ['totaltime'], rows: [['90122']] }} />)
    expect(screen.getByText('01d 01h 02m 02s')).toBeInTheDocument()
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

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

test('headers are clickable', () => {
    render(<TableView table={SIMPLE_TABLE} />)
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

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

test('renders Prev and Next buttons', () => {
    render(<TableView table={LARGE_TABLE} />)
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
})

test('renders page indicator', () => {
    render(<TableView table={LARGE_TABLE} />)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
})

test('Prev is disabled on first page', () => {
    render(<TableView table={LARGE_TABLE} />)
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
})

test('Next is disabled on last page', () => {
    render(<TableView table={LARGE_TABLE} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('Next advances to next page', () => {
    render(<TableView table={LARGE_TABLE} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
})

test('Prev goes back to previous page', () => {
    render(<TableView table={LARGE_TABLE} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
})

test('renders page size selector', () => {
    render(<TableView table={LARGE_TABLE} />)
    expect(screen.getByRole('combobox', { name: 'Page size' })).toBeInTheDocument()
})

test('default page size is 25', () => {
    render(<TableView table={LARGE_TABLE} />)
    expect(screen.getByRole('combobox', { name: 'Page size' })).toHaveValue('25')
})

test('changing page size resets to page 1', () => {
    render(<TableView table={LARGE_TABLE} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Page size' }), {
        target: { value: '10' }
    })
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
})

test('sorting resets to page 1', () => {
    render(<TableView table={LARGE_TABLE} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Name'))
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
})

test('only renders one page of rows at a time', () => {
    render(<TableView table={LARGE_TABLE} />)
    expect(screen.getAllByRole('row').length).toBe(26) // 25 data rows + 1 header
})

test('last page renders remaining rows', () => {
    render(<TableView table={LARGE_TABLE} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getAllByRole('row').length).toBe(6) // 5 remaining rows + 1 header
})
