import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import { ProgressionTimeline } from './ProgressionTimeline'
import { formatTimestamp } from '../utils/format'

const NOW = Math.floor(Date.now() / 1000)
const ONE_TIMESTAMP  = [{ id: 1, scraped_at: NOW - 3600 }]
const TWO_TIMESTAMPS = [{ id: 1, scraped_at: NOW - 7200 }, { id: 2, scraped_at: NOW - 3600 }]

describe('Range buttons', () => {
    test('1D range button always renders', () => {
        render(<ProgressionTimeline timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: '1D' })).toBeInTheDocument()
    })

    test('1D range button is disabled by default', () => {
        render(<ProgressionTimeline timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: '1D' })).toBeDisabled()
    })

    test('other range buttons hidden when insufficient data', () => {
        render(<ProgressionTimeline timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.queryByRole('button', { name: '1W' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: '1M' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: '1Y' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
    })
})

describe('Slider', () => {
    test('slider hidden when one timestamp', () => {
        render(<ProgressionTimeline timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    })

    test('slider visible when multiple timestamps', () => {
        render(<ProgressionTimeline timestamps={TWO_TIMESTAMPS} onChange={vi.fn()} />)
        expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    test('slider displays formatted timestamp of selected entry', () => {
        vi.useFakeTimers()
        render(<ProgressionTimeline timestamps={TWO_TIMESTAMPS} onChange={vi.fn()} />)
        act(() => vi.advanceTimersByTime(300))
        const expected = formatTimestamp(TWO_TIMESTAMPS[1].scraped_at)
        expect(screen.getByText(expected)).toBeInTheDocument()
        vi.useRealTimers()
    })
})

describe('PeriodNavigator', () => {
    test('renders Prev and Next when range is not All', () => {
        render(<ProgressionTimeline timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.getByText('Prev')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
    })
})
