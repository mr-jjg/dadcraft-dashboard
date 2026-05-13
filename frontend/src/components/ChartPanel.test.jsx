import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { ChartPanel } from './ChartPanel'
import { useMetricRange } from '../hooks/useMetricRange'

vi.mock('../hooks/useMetricRange')

const lines = [
    { key: 'load1', endpoint: '/api/system/load1/range', color: '#8884d8' },
    { key: 'load5', endpoint: '/api/system/load5/range', color: '#82ca9d' },
]

const mockData = [
    { time: 1, value: 4127.0546875 },
    { time: 2, value: 4161.3046875 },
    { time: 3, value: 4216.4296875 }
]

test('renders label', () => {
    useMetricRange.mockReturnValue({ data: null, error: null })
    render(<ChartPanel label="Chart" lines={lines} />)
    expect(screen.getByText('Chart')).toBeInTheDocument()
})

test('renders chart when data is available', () => {
    useMetricRange.mockReturnValue({ data: mockData, error: null })
    render(<ChartPanel label="Chart" lines={lines} />)
    expect(screen.getByText('Chart')).toBeInTheDocument()
    expect(screen.queryByText('Error')).not.toBeInTheDocument()
})

test('renders error message on failure', () => {
    useMetricRange.mockReturnValue({ data: null, error: new Error('500') })
    render(<ChartPanel label="Chart" lines={lines} />)
    expect(screen.getByText('Error: 500')).toBeInTheDocument()
})

test('does not render error message when data loads successfully', () => {
    useMetricRange.mockReturnValue({ data: mockData, error: null })
    render(<ChartPanel label="Chart" lines={lines} />)
    expect(screen.queryByText(/Error/)).not.toBeInTheDocument()
})

test('renders empty chart when lines is empty', () => {
    render(<ChartPanel label="No metric selected" lines={[]} />)
    expect(screen.getByText('No metric selected')).toBeInTheDocument()
    expect(screen.queryByText(/Error/)).not.toBeInTheDocument()
})
