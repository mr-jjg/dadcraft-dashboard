import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { TableView } from './TableView'

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
    render(<TableView table={{
        columns: ['Name', 'Level'],
        rows: [['Ungagan', '28'], ['Granie', '16']]
    }} />)
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
