import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { CpuPanel } from './CpuPanel'
import { useCpu } from '../hooks/useMetrics'

vi.mock('../hooks/useMetrics')

test('renders loading state', () => {
    useCpu.mockReturnValue({ value: null, error: null })

    render(<CpuPanel />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('renders cpu value', () => {
    useCpu.mockReturnValue({ value: 75.0, error: null })

    render(<CpuPanel />)

    expect(screen.getByText('CPU: 75%')).toBeInTheDocument()
})

test('renders error', () => {
    useCpu.mockReturnValue({ value: null, error: new Error('500') })

    render(<CpuPanel />)

    expect(screen.getByText('Error: 500')).toBeInTheDocument()
})
