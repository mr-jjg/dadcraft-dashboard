import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
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
        onChange(1)
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

test('renders heading', () => {
    render(<ProgressionPanel />)
    expect(screen.getByText('Population Progression')).toBeInTheDocument()
})

test('renders error message on progression error', () => {
    useProgression.mockReturnValue({ progression: null, error: new Error('500') })
    render(<ProgressionPanel />)
    expect(screen.getByText('Error loading progression data')).toBeInTheDocument()
})
