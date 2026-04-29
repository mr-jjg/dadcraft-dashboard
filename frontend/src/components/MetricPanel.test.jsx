import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MetricPanel } from './MetricPanel'
import { useMetric } from '../hooks/useMetrics'

vi.mock('../hooks/useMetrics')

test('renders loading state', () => {
    useMetric.mockReturnValue({ value: null, error: null })

    render(<MetricPanel label="METRIC" endpoint="/api/metric" unit=" u" />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('renders metric value with explicit precision', () => {
    useMetric.mockReturnValue({ value: 75.33, error: null })

    render(<MetricPanel label="METRIC" endpoint="/api/metric" unit=" u" precision={1} />)

    expect(screen.getByText('METRIC: 75.3 u')).toBeInTheDocument()
})

test('renders metric value with default precision', () => {
    useMetric.mockReturnValue({ value: 75.33, error: null })

    render(<MetricPanel label="METRIC" endpoint="/api/metric" unit=" u" />)

    expect(screen.getByText('METRIC: 75 u')).toBeInTheDocument()
})

test('renders error', () => {
    useMetric.mockReturnValue({ value: null, error: new Error('500') })

    render(<MetricPanel label="METRIC" endpoint="/api/metric" unit=" u" />)

    expect(screen.getByText('Error: 500')).toBeInTheDocument()
})
