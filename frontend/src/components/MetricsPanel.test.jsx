import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MetricsPanel } from './MetricsPanel'

vi.mock('./MetricTile', () => ({
    MetricTile: ({ metric, active, onClick }) => (
        <div
            data-testid={`tile-${metric.label}`}
            data-active={active}
            onClick={metric.lines ? onClick : undefined}
        >
            {metric.label}
        </div>
    )
}))

vi.mock('./ChartPanel', () => ({
    ChartPanel: ({ label, lines }) => (
        <div data-testid="chart-panel">
            <span>{label}</span>
            <span data-testid="line-count">{lines.length}</span>
        </div>
    )
}))

test('renders h2 heading', () => {
    render(<MetricsPanel />)
    expect(screen.getByText('Metrics')).toBeInTheDocument()
})

test('renders all metric tiles', () => {
    render(<MetricsPanel />)
    expect(screen.getByTestId('tile-CPU')).toBeInTheDocument()
    expect(screen.getByTestId('tile-Memory')).toBeInTheDocument()
    expect(screen.getByTestId('tile-Game Server CPU')).toBeInTheDocument()
    expect(screen.getByTestId('tile-Game Server Memory')).toBeInTheDocument()
})

test('selecting a tile passes its lines to ChartPanel', () => {
    render(<MetricsPanel />)
    fireEvent.click(screen.getByTestId('tile-CPU'))
    expect(screen.getByTestId('line-count').textContent).not.toBe('0')
})
