import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ProgressionPanel } from './ProgressionPanel'
import { useProgression } from '../hooks/useProgression'

vi.mock('../hooks/useProgression')

test('renders heading', () => {
    useProgression.mockReturnValue({ progression: null, error: null })

    render(<ProgressionPanel />)

    expect(screen.getByText('Population Progression')).toBeInTheDocument()
})

test('renders error message on progression error', () => {
    useProgression.mockReturnValue({ progression: null, error: new Error('500') })

    render(<ProgressionPanel />)

    expect(screen.getByText('Error loading progression data')).toBeInTheDocument()
})

test('renders filter controls', () => {
    useProgression.mockReturnValue({ progression: null, error: null })

    render(<ProgressionPanel />)

    expect(screen.getByText('Online only')).toBeInTheDocument()
    expect(screen.getByText('Faction')).toBeInTheDocument()
})
