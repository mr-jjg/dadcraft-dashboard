import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
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
    ChartPanel: ({ label, lines, onWindowChange, stepOverride }) => (
        <div data-testid="chart-panel">
            <span>{label}</span>
            <span data-testid="line-count">{lines.length}</span>
            <span data-testid="step-override">{stepOverride ?? 'none'}</span>
            <button onClick={() => onWindowChange(3600)}>report window</button>
        </div>
    )
}))

vi.mock('./MetricsTimeline', () => ({
    MetricsTimeline: ({ windowSeconds, onChange }) => (
        <div data-testid="metrics-timeline">
            <span data-testid="window-seconds">{windowSeconds}</span>
            <button onClick={() => onChange(120)}>set step</button>
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

test('renders chart panel with prompt by default', () => {
    render(<MetricsPanel />)
    expect(screen.getByText('Select a metric to view history')).toBeInTheDocument()
    expect(screen.getByTestId('line-count').textContent).toBe('0')
})

test('selecting a tile passes its lines to ChartPanel', () => {
    render(<MetricsPanel />)
    fireEvent.click(screen.getByTestId('tile-CPU'))
    expect(screen.getByTestId('line-count').textContent).not.toBe('0')
})

test('clicking an active tile deselects it', () => {
    render(<MetricsPanel />)
    fireEvent.click(screen.getByTestId('tile-CPU'))
    fireEvent.click(screen.getByTestId('tile-CPU'))
    expect(screen.getByText('Select a metric to view history')).toBeInTheDocument()
})

test('MetricsTimeline not rendered before ChartPanel reports window', () => {
    render(<MetricsPanel />)
    expect(screen.queryByTestId('metrics-timeline')).not.toBeInTheDocument()
})

test('MetricsTimeline renders after ChartPanel reports window', () => {
    render(<MetricsPanel />)
    act(() => { fireEvent.click(screen.getByText('report window')) })
    expect(screen.getByTestId('metrics-timeline')).toBeInTheDocument()
})

test('MetricsTimeline receives windowSeconds from ChartPanel', () => {
    render(<MetricsPanel />)
    act(() => { fireEvent.click(screen.getByText('report window')) })
    expect(screen.getByTestId('window-seconds').textContent).toBe('3600')
})

test('stepOverride passed to ChartPanel after MetricsTimeline emits step', () => {
    render(<MetricsPanel />)
    act(() => { fireEvent.click(screen.getByText('report window')) })
    act(() => { fireEvent.click(screen.getByText('set step')) })
    expect(screen.getByTestId('step-override').textContent).toBe('120')
})
