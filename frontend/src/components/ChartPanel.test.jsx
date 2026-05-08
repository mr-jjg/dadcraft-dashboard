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

test('renders loading state', () => {
    useMetricRange.mockReturnValue({ data: null, error: null})

    render(<ChartPanel label="Chart" lines={lines} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('renders chart with label', () => {
    useMetricRange.mockReturnValue({
        data: [
            { time: 1, value: 4127.0546875 },
            { time: 2, value: 4161.3046875 },
            { time: 3, value: 4216.4296875 }
        ],
        error: null
    })

    render(<ChartPanel label="Chart" lines={lines} />)

    expect(screen.getByText('Chart')).toBeInTheDocument()
})

test('renders error', () => {
    useMetricRange.mockReturnValue({ data: null, error: new Error('500')})

    render(<ChartPanel label="Chart" lines={lines} />)

    expect(screen.getByText('Error: 500')).toBeInTheDocument()
})
