import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { expect, test, vi, beforeEach, describe } from 'vitest'
import { ChartPanel } from './ChartPanel'
import { useChartData } from '../hooks/useChartData'

vi.mock('../hooks/useChartData')
vi.mock('recharts', () => ({
    LineChart:     ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line:          () => null,
    XAxis:         () => null,
    YAxis:         () => null,
    CartesianGrid: () => null,
    Tooltip:       () => null,
    Legend:        () => null,
    Brush:         () => null,
}))

const LINES = [
    { key: 'load1', endpoint: '/api/system/load1/range', color: '#8884d8' },
    { key: 'load5', endpoint: '/api/system/load5/range', color: '#82ca9d' },
]

const MOCK_DATA = [
    { time: 1000, load1: 0.42, load5: 0.61 },
    { time: 2000, load1: 0.38, load5: 0.59 },
]

beforeEach(() => {
    vi.clearAllMocks()
    useChartData.mockReturnValue({
        overviewData:  MOCK_DATA,
        detailData:    MOCK_DATA,
        overviewError: null,
        detailError:   null,
        windowSeconds: 3600,
        onBrushChange: vi.fn(),
    })
})

describe('rendering', () => {
    test('renders label', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getByText('Load')).toBeInTheDocument()
    })

    test('renders two charts when data is available', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getAllByTestId('line-chart')).toHaveLength(2)
    })

    test('renders no charts when lines is empty', () => {
        useChartData.mockReturnValue({
            overviewData:  [],
            detailData:    [],
            overviewError: null,
            detailError:   null,
            windowSeconds: 3600,
            onBrushChange: vi.fn(),
        })
        render(<ChartPanel label="No metric" lines={[]} />)
        expect(screen.queryAllByTestId('line-chart')).toHaveLength(2)
    })
})

describe('error handling', () => {
    test('renders overviewError message', () => {
        useChartData.mockReturnValue({
            overviewData:  [],
            detailData:    [],
            overviewError: new Error('500'),
            detailError:   null,
            windowSeconds: 3600,
            onBrushChange: vi.fn(),
        })
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getByText('Error: 500')).toBeInTheDocument()
    })

    test('renders detailError message', () => {
        useChartData.mockReturnValue({
            overviewData:  MOCK_DATA,
            detailData:    [],
            overviewError: null,
            detailError:   new Error('detail failed'),
            windowSeconds: 3600,
            onBrushChange: vi.fn(),
        })
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getByText('Error: detail failed')).toBeInTheDocument()
    })

    test('does not render charts on error', () => {
        useChartData.mockReturnValue({
            overviewData:  [],
            detailData:    [],
            overviewError: new Error('500'),
            detailError:   null,
            windowSeconds: 3600,
            onBrushChange: vi.fn(),
        })
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.queryAllByTestId('line-chart')).toHaveLength(0)
    })
})

describe('onWindowChange', () => {
    test('calls onWindowChange with windowSeconds on mount', () => {
        const onWindowChange = vi.fn()
        render(<ChartPanel label="Load" lines={LINES} onWindowChange={onWindowChange} />)
        expect(onWindowChange).toHaveBeenCalledWith(3600)
    })

    test('calls onWindowChange when windowSeconds changes', () => {
        const onWindowChange = vi.fn()
        const { rerender } = render(<ChartPanel label="Load" lines={LINES} onWindowChange={onWindowChange} />)

        useChartData.mockReturnValue({
            overviewData:  MOCK_DATA,
            detailData:    MOCK_DATA,
            overviewError: null,
            detailError:   null,
            windowSeconds: 1800,
            onBrushChange: vi.fn(),
        })

        rerender(<ChartPanel label="Load updated" lines={LINES} onWindowChange={onWindowChange} />)
        expect(onWindowChange).toHaveBeenCalledWith(1800)
    })

    test('does not crash when onWindowChange is not provided', () => {
        expect(() => render(<ChartPanel label="Load" lines={LINES} />)).not.toThrow()
    })
})
