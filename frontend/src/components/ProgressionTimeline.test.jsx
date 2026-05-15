import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { vi } from 'vitest'
import { ProgressionTimeline } from './ProgressionTimeline'

const NOW = Math.floor(Date.now() / 1000)
const ONE_TIMESTAMP  = [{ id: 1, scraped_at: NOW - 3600 }]
const TWO_TIMESTAMPS = [{ id: 1, scraped_at: NOW - 7200 }, { id: 2, scraped_at: NOW - 3600 }]

vi.mock('./PeriodNavigator', () => ({
    PeriodNavigator: ({ onChange }) => {
        useEffect(() => { onChange(Math.floor(Date.now() / 1000)) }, [])
        return null
    }
}))
vi.mock('./SnapshotSlider', () => ({
    SnapshotSlider: () => null
}))

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
