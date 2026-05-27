import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, vi } from 'vitest'
import { ProgressionPanel } from './ProgressionPanel'
import { useProgression } from '../hooks/useProgression'
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps'

vi.mock('../hooks/useProgression')
vi.mock('../hooks/useProgressionTimestamps')

const NOW = Math.floor(Date.now() / 1000)
const ONE_TIMESTAMP  = [{ id: 1, scraped_at: NOW - 3600 }]
const TWO_TIMESTAMPS = [{ id: 1, scraped_at: NOW - 7200 }, { id: 2, scraped_at: NOW - 3600 }]

vi.mock('./ProgressionTimeline', () => ({
    ProgressionTimeline: ({ onChange }) => {
        useEffect(() => { onChange(1) }, [])
        return null
    }
}))
vi.mock('./ProgressionFilters', () => ({
    ProgressionFilters: () => null
}))

beforeEach(() => {
    useProgression.mockReturnValue({ progression: null, error: null })
    useProgressionTimestamps.mockReturnValue({ timestamps: [] })
})

afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }))
})

test('renders heading', () => {
    render(<ProgressionPanel />)
    expect(screen.getByText('Population Progression')).toBeInTheDocument()
})

test('renders error message on progression error', () => {
    useProgression.mockReturnValue({ progression: null, error: new Error('500') })
    render(<ProgressionPanel />)
    expect(screen.getByText('Error loading progression data')).toBeInTheDocument()
})

test('controls are collapsed by default on mobile', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }))
    render(<ProgressionPanel />)
    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument()
})

test('controls are open by default on desktop', () => {
    render(<ProgressionPanel />)
    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument()
})
