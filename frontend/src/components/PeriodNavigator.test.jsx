import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { PeriodNavigator } from './PeriodNavigator'
import { snapToPeriodStart } from '../utils/period'

const NOW = Math.floor(Date.now() / 1000)
const TIMESTAMPS = [
    { id: 1, scraped_at: NOW - 86400 * 30 },
    { id: 2, scraped_at: NOW - 3600 },
]

const TODAY_START = snapToPeriodStart(new Date(), '1D')

test('renders Prev and Next buttons', () => {
    render(<PeriodNavigator range="1D" timestamps={TIMESTAMPS} periodStart={TODAY_START} onResnap={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
})

test('both buttons disabled when timestamps is null', () => {
    render(<PeriodNavigator range="1D" timestamps={null} periodStart={TODAY_START} onResnap={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Prev')).toBeDisabled()
    expect(screen.getByText('Next')).toBeDisabled()
})

test('both buttons disabled when timestamps is empty', () => {
    render(<PeriodNavigator range="1D" timestamps={[]} periodStart={TODAY_START} onResnap={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Prev')).toBeDisabled()
    expect(screen.getByText('Next')).toBeDisabled()
})

test('Next disabled when at current period', () => {
    render(<PeriodNavigator range="1D" timestamps={TIMESTAMPS} periodStart={TODAY_START} onResnap={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Next')).toBeDisabled()
})

test('onResnap fires on mount with a Date', () => {
    const onResnap = vi.fn()
    render(<PeriodNavigator range="1D" timestamps={TIMESTAMPS} periodStart={TODAY_START} onResnap={onResnap} onNavigate={vi.fn()} />)
    expect(onResnap).toHaveBeenCalled()
    expect(onResnap.mock.calls[0][0] instanceof Date).toBe(true)
})

test('clamps to first data period when range change would land before first timestamp', () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const firstTs = today.getTime() / 1000
    const timestamps = [{ id: 1, scraped_at: firstTs }]
    const firstPeriod = snapToPeriodStart(new Date(firstTs * 1000), '1D')

    const onResnap = vi.fn()
    render(<PeriodNavigator range="1D" timestamps={timestamps} periodStart={null} onResnap={onResnap} onNavigate={vi.fn()} />)

    expect(onResnap).toHaveBeenCalledWith(firstPeriod)
})
