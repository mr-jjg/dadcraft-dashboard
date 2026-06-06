import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, test, expect, describe } from 'vitest'
import { MetricsTimeline } from './MetricsTimeline'

const ONE_HOUR = 3600;

describe('rendering', () => {
    test('renders granularity label', () => {
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 6} onChange={vi.fn()} ready />)
        expect(screen.getByText('Granularity')).toBeInTheDocument()
    })

    test('renders available steps as options', () => {
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 6} onChange={vi.fn()} ready />)
        expect(screen.getByRole('option', { name: '15s' })).toBeInTheDocument()
    })

    test('renders disabled select when not ready', () => {
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 6} onChange={vi.fn()} />)
        expect(screen.getByRole('combobox')).toBeDisabled()
    })

    test('coarser steps excluded for small window', () => {
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 6} onChange={vi.fn()} ready />)
        expect(screen.queryByRole('option', { name: '3600s' })).not.toBeInTheDocument()
    })

    test('fine steps excluded for large window', () => {
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 24 * 90} onChange={vi.fn()} ready />)
        expect(screen.queryByRole('option', { name: '15s' })).not.toBeInTheDocument()
    })
})

describe('onChange behavior', () => {
    test('calls onChange on mount with initial step', () => {
        const onChange = vi.fn()
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 6} onChange={onChange} ready />)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    test('calls onChange when user selects a step', () => {
        const onChange = vi.fn()
        render(<MetricsTimeline windowSeconds={ONE_HOUR * 24} onChange={onChange} ready />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '120' } })
        expect(onChange).toHaveBeenCalledWith(120)
    })

    test('calls onChange when current step becomes unavailable after window change', () => {
        const onChange = vi.fn()
        const { rerender } = render(
            <MetricsTimeline windowSeconds={ONE_HOUR * 24 * 90} onChange={onChange} ready />
        )
        rerender(<MetricsTimeline windowSeconds={ONE_HOUR * 6} onChange={onChange} ready />)
        expect(onChange).toHaveBeenLastCalledWith(300)
    })
})
