import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MetricTile } from './MetricTile'
import { useMetric } from '../hooks/useMetrics'

vi.mock('../hooks/useMetrics')

const clickableMetric   = { label: 'CPU', endpoint: '/api/system/cpu', unit: '%', precision: 1,
                            lines: [{ key: 'CPU', endpoint: '/api/system/cpu/range', color: '#8884d8' }] }

describe('Rendering', () => {
    test('renders label and value', () => {
        useMetric.mockReturnValue({ value: 75.3, error: null })
        render(<MetricTile metric={clickableMetric} active={false} onClick={vi.fn()} />)
        expect(screen.getByText(/CPU/)).toBeInTheDocument()
        expect(screen.getByText('75.3%')).toBeInTheDocument()
    })

    test('renders ... while loading', () => {
        useMetric.mockReturnValue({ value: null, error: null })
        render(<MetricTile metric={clickableMetric} active={false} onClick={vi.fn()} />)
        expect(screen.getByText('...')).toBeInTheDocument()
    })

    test('renders Error on failure', () => {
        useMetric.mockReturnValue({ value: null, error: new Error('500') })
        render(<MetricTile metric={clickableMetric} active={false} onClick={vi.fn()} />)
        expect(screen.getByText('Error')).toBeInTheDocument()
    })
})

describe('Clickability', () => {
    test('calls onClick when clickable tile is clicked', () => {
        useMetric.mockReturnValue({ value: 75.3, error: null })
        const onClick = vi.fn()
        render(<MetricTile metric={clickableMetric} active={false} onClick={onClick} />)
        screen.getByText('75.3%').closest('div').click()
        expect(onClick).toHaveBeenCalled()
    })
})
