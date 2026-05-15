import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from './App.jsx'

vi.mock('./components/LeaderboardPanel')
vi.mock('./components/MetricsPanel')
vi.mock('./components/ProgressionPanel')
vi.mock('./components/ServerBanner')

test('returns H1 "Dadcraft Dashboard"', () => {
    render(<App />)
    const header = screen.getByRole('heading', { level: 1 })

    expect(header).toHaveTextContent('Dadcraft Dashboard')
})
