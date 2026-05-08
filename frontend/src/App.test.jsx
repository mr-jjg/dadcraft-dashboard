import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from './App.jsx'

vi.mock('./components/ChartPanel')
vi.mock('./components/LeaderboardPanel')
vi.mock('./components/MetricPanel')
vi.mock('./components/ProcessPanel')
vi.mock('./components/ProgressionPanel')
vi.mock('./components/GamePanel')

test('returns H1 "Dadcraft Dashboard"', () => {
    render(<App />)
    const header = screen.getByRole('heading')

    expect(header).toHaveTextContent('Dadcraft Dashboard')
})
