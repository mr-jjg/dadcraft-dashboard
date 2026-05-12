import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { PeriodNavigator } from './PeriodNavigator'

const NOW = Math.floor(Date.now() / 1000)
const TIMESTAMPS = [
    { id: 1, scraped_at: NOW - 86400 * 30 },
    { id: 2, scraped_at: NOW - 3600 },
]

test('renders Prev and Next buttons', () => {
    render(<PeriodNavigator range="1D" timestamps={TIMESTAMPS} onChange={vi.fn()} />)
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
})

test('both buttons disabled when timestamps is null', () => {
    render(<PeriodNavigator range="1D" timestamps={null} onChange={vi.fn()} />)
    expect(screen.getByText('Prev')).toBeDisabled()
    expect(screen.getByText('Next')).toBeDisabled()
})

test('both buttons disabled when timestamps is empty', () => {
    render(<PeriodNavigator range="1D" timestamps={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Prev')).toBeDisabled()
    expect(screen.getByText('Next')).toBeDisabled()
})

test('Next disabled when at current period', () => {
    render(<PeriodNavigator range="1D" timestamps={TIMESTAMPS} onChange={vi.fn()} />)
    expect(screen.getByText('Next')).toBeDisabled()
})

test('onChange fires on mount with periodEnd', () => {
    const onChange = vi.fn()
    render(<PeriodNavigator range="1D" timestamps={TIMESTAMPS} onChange={onChange} />)
    expect(onChange).toHaveBeenCalled()
    expect(typeof onChange.mock.calls[0][0]).toBe('number')
})

test('clamps label to first data period when range change would land before first timestamp', () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const firstTs = today.getTime() / 1000
    const timestamps = [{ id: 1, scraped_at: firstTs }]
    const todayLabel = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })

    const { rerender } = render(
        <PeriodNavigator range="1W" timestamps={timestamps} onChange={vi.fn()} />
    )
    rerender(<PeriodNavigator range="1D" timestamps={timestamps} onChange={vi.fn()} />)
    expect(screen.getByText(todayLabel)).toBeInTheDocument()
})
