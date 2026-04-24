import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ProcessPanel } from './ProcessPanel'
import { MetricPanel } from './MetricPanel'

vi.mock('./MetricPanel')

test('renders cpu, memory, and procs panels', () => {
    MetricPanel.mockImplementation(({ label }) => <p>{label}</p>)

    render(<ProcessPanel name="mangosd" />)

    expect(screen.getByText('mangosd CPU')).toBeInTheDocument()
    expect(screen.getByText('mangosd memory')).toBeInTheDocument()
    expect(screen.getByText('mangosd procs')).toBeInTheDocument()
})
