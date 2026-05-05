import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ProgressionPanel } from './ProgressionPanel'
import { useProgression } from '../hooks/useProgression'
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps'

vi.mock('../hooks/useProgression')
vi.mock('../hooks/useProgressionTimestamps')

test('renders heading', () => {
    useProgressionTimestamps.mockReturnValue({ timestamps: [], error: null })
    useProgression.mockReturnValue({ progression: null, error: null })

    render(<ProgressionPanel />)

    expect(screen.getByText('Population Progression')).toBeInTheDocument()
})

test('renders error message on progression error', () => {
    useProgressionTimestamps.mockReturnValue({ timestamps: [], error: null })
    useProgression.mockReturnValue({ progression: null, error: new Error('500') })

    render(<ProgressionPanel />)

    expect(screen.getByText('Error loading progression data')).toBeInTheDocument()
})

test('renders filter controls', () => {
    useProgressionTimestamps.mockReturnValue({ timestamps: [1777865100, 1777871040], error: null })
    useProgression.mockReturnValue({ progression: null, error: null })

    render(<ProgressionPanel />)

    expect(screen.getByText('Online only')).toBeInTheDocument()
    expect(screen.getByText('Faction')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
})
