import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from './App.jsx'

vi.mock('./components/CharacterSearchPanel')
vi.mock('./components/LeaderboardPanel')
vi.mock('./components/MetricsPanel')
vi.mock('./components/ProgressionPanel')
vi.mock('./components/ServerBanner')

test('renders tab navigation', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Progression' })).toBeInTheDocument()
})
