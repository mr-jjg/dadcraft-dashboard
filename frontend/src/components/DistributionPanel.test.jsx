import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { DistributionPanel } from './DistributionPanel'
import { useDistribution } from '../hooks/useDistributions'

vi.mock('../hooks/useDistributions')

test('renders loading state', () => {
    useDistribution.mockReturnValue({ value: null, error: null})

    render(<DistributionPanel heading="Distribution" endpoint="api/distribution" />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('renders table values', () => {
    useDistribution.mockReturnValue({
        distribution: [
            {"label":"Distribution1","value":4},
            {"label":"Distribution2","value":29}
        ],
        error: null
    })

    render(<DistributionPanel heading="Distribution" endpoint="api/distribution" />)

    expect(screen.getByText('Distribution')).toBeInTheDocument()
    expect(screen.getByText('Distribution1: 4')).toBeInTheDocument()
    expect(screen.getByText('Distribution2: 29')).toBeInTheDocument()
})

test('renders error', () => {
    useDistribution.mockReturnValue({ distribution: null, error: new Error('500')})

    render(<DistributionPanel heading="Distribution" endpoint="api/distribution" />)
    expect(screen.getByText('Error: 500')).toBeInTheDocument()
})
