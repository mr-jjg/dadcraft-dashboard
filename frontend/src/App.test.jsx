import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useMetric } from './hooks/useMetrics'
import { App } from './App.jsx'

vi.mock('./hooks/useMetrics')

beforeEach(() => {
    useMetric.mockReturnValue({ value: null, error: null })
})

test('returns H1 "Dadcraft Dashboard"', () => {
    render(<App />)
    const header = screen.getByRole('heading')

    expect(header).toHaveTextContent('Dadcraft Dashboard')
})

test('happy path returns P "OK"', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('OK')
    })

    render(<App />)
    
    const paragraph = await screen.findByText('OK')
    expect(paragraph).toHaveTextContent('OK')
})

test('error path returns P "Response status: <some error>"', async () => {
    global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500
    })

    render(<App />)

    const paragraph = await screen.findByText('Response status: 500')
    expect(paragraph).toHaveTextContent('Response status: 500')
})