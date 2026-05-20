import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { expect, test, vi, beforeEach, describe } from 'vitest'
import { ChartPanel } from './ChartPanel'
import { useChartData } from '../hooks/useChartData'

vi.mock('../hooks/useChartData')
vi.mock('./MetricsTimeline', () => ({
    MetricsTimeline: ({ windowSeconds, onChange }) => (
        <div data-testid="metrics-timeline">
            <span data-testid="window-seconds">{windowSeconds}</span>
            <button onClick={() => onChange(120)}>set step</button>
        </div>
    )
}))
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
        brushKey:      0,
    })
})

describe('rendering', () => {
    test('renders label', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getByText('Load')).toBeInTheDocument()
    })

    test('renders two charts when data is available', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getAllByTestId('line-chart')).toHaveLength(3)
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
        expect(screen.queryAllByTestId('line-chart')).toHaveLength(3)
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

describe('MetricsTimeline', () => {
    test('MetricsTimeline not rendered when windowSeconds is zero', () => {
        useChartData.mockReturnValue({
            overviewData:  [],
            detailData:    [],
            overviewError: null,
            detailError:   null,
            windowSeconds: 0,
            onBrushChange: vi.fn(),
        })
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.queryByTestId('metrics-timeline')).not.toBeInTheDocument()
    })

    test('MetricsTimeline renders when windowSeconds is set', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getByTestId('metrics-timeline')).toBeInTheDocument()
    })

    test('MetricsTimeline receives windowSeconds from hook', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        expect(screen.getByTestId('window-seconds').textContent).toBe('3600')
    })

    test('stepOverride passed to useChartData after MetricsTimeline emits step', () => {
        render(<ChartPanel label="Load" lines={LINES} />)
        act(() => { fireEvent.click(screen.getByText('set step')) })
        expect(useChartData).toHaveBeenLastCalledWith(LINES, undefined, 120)
    })
})
