import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ProgressionTimeline } from './ProgressionTimeline'

const NOW = Math.floor(Date.now() / 1000)
const ONE_TIMESTAMP  = [{ id: 1, scraped_at: NOW - 3600 }]
const TWO_TIMESTAMPS = [{ id: 1, scraped_at: NOW - 7200 }, { id: 2, scraped_at: NOW - 3600 }]

const DEFAULT_TIMELINE = { range: '1D', periodStart: null, sliderPosition: null }

vi.mock('./PeriodNavigator', () => ({
    PeriodNavigator: () => null
}))
vi.mock('./SnapshotSlider', () => ({
    SnapshotSlider: () => null
}))

describe('Range buttons', () => {
    test('1D range button always renders', () => {
        render(<ProgressionTimeline timeline={DEFAULT_TIMELINE} onTimelineChange={vi.fn()} timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: '1D' })).toBeInTheDocument()
    })

    test('1D range button is enabled by default', () => {
        render(<ProgressionTimeline timeline={DEFAULT_TIMELINE} onTimelineChange={vi.fn()} timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: '1D' })).toBeEnabled()
    })

    test('other range buttons hidden when insufficient data', () => {
        render(<ProgressionTimeline timeline={DEFAULT_TIMELINE} onTimelineChange={vi.fn()} timestamps={ONE_TIMESTAMP} onChange={vi.fn()} />)
        expect(screen.queryByRole('button', { name: '1W' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: '1M' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: '1Y' })).not.toBeInTheDocument()
    })

    test('clicking a range button resets slider position', () => {
        const onTimelineChange = vi.fn()
        render(<ProgressionTimeline timeline={DEFAULT_TIMELINE} onTimelineChange={onTimelineChange} timestamps={TWO_TIMESTAMPS} onChange={vi.fn()} />)
        fireEvent.click(screen.getByRole('button', { name: '1D' }))
        expect(onTimelineChange).toHaveBeenCalledWith({ range: '1D', sliderPosition: null })
    })
})
