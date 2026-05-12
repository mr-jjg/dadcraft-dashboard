import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import { SnapshotSlider } from './SnapshotSlider'
import { formatTimestamp } from '../utils/format'

const NOW = Math.floor(Date.now() / 1000)
const ONE_SNAPSHOT  = [{ id: 1, scraped_at: NOW - 3600 }]
const TWO_SNAPSHOTS = [{ id: 1, scraped_at: NOW - 7200 }, { id: 2, scraped_at: NOW - 3600 }]

describe('Rendering', () => {
    test('renders nothing when snapshots has one entry', () => {
        const { container } = render(<SnapshotSlider snapshots={ONE_SNAPSHOT} onChange={vi.fn()} />)
        expect(container.firstChild).toBeNull()
    })

    test('renders slider when snapshots has multiple entries', () => {
        render(<SnapshotSlider snapshots={TWO_SNAPSHOTS} onChange={vi.fn()} />)
        expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    test('displays formatted timestamp of the last snapshot by default', () => {
        vi.useFakeTimers()
        render(<SnapshotSlider snapshots={TWO_SNAPSHOTS} onChange={vi.fn()} />)
        act(() => vi.advanceTimersByTime(300))
        expect(screen.getByText(formatTimestamp(TWO_SNAPSHOTS[1].scraped_at))).toBeInTheDocument()
        vi.useRealTimers()
    })
})

describe('onChange', () => {
    test('fires on mount with the last snapshot id', () => {
        const onChange = vi.fn()
        vi.useFakeTimers()
        render(<SnapshotSlider snapshots={TWO_SNAPSHOTS} onChange={onChange} />)
        act(() => vi.advanceTimersByTime(300))
        expect(onChange).toHaveBeenCalledWith(TWO_SNAPSHOTS[1].id)
        vi.useRealTimers()
    })

    test('fires with null when snapshots is empty', () => {
        const onChange = vi.fn()
        vi.useFakeTimers()
        render(<SnapshotSlider snapshots={[]} onChange={onChange} />)
        act(() => vi.advanceTimersByTime(300))
        expect(onChange).toHaveBeenCalledWith(null)
        vi.useRealTimers()
    })
})
