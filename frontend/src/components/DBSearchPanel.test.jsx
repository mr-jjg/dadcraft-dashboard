import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DBSearchPanel } from './DBSearchPanel'
import { fetchCharacterFields, fetchCharacterSearch } from '../api/characterSearch'

vi.mock('../api/characterSearch')

const MOCK_FIELDS = [
    { field: 'name',   type: 'string',  label: 'Name' },
    { field: 'level',  type: 'range',   label: 'Level', min: 1, max: 60 },
    { field: 'race',   type: 'enum',    label: 'Race',  values: ['Human', 'Orc'] },
    { field: 'online', type: 'boolean', label: 'Online' },
]

const MOCK_RESULT = {
    columns: ['name', 'level'],
    rows: [['Ungagan', '28'], ['Granie', '16']],
}

beforeEach(() => {
    fetchCharacterFields.mockResolvedValue(MOCK_FIELDS)
    fetchCharacterSearch.mockResolvedValue(MOCK_RESULT)
})

afterEach(() => {
    vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Loading and error states
// ---------------------------------------------------------------------------

test('shows loading while fields are being fetched', () => {
    fetchCharacterFields.mockReturnValue(new Promise(() => {})) // never resolves
    render(<DBSearchPanel />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('shows error when fields fetch fails', async () => {
    fetchCharacterFields.mockRejectedValue(new Error('503'))
    render(<DBSearchPanel />)
    await waitFor(() => {
        expect(screen.getByText('Error loading fields: 503')).toBeInTheDocument()
    })
})

// ---------------------------------------------------------------------------
// Rendered state after fields load
// ---------------------------------------------------------------------------

test('renders heading after fields load', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => {
        expect(screen.getByText('Character Search')).toBeInTheDocument()
    })
})

test('renders Add Filter button after fields load', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add Filter' })).toBeInTheDocument()
    })
})

test('renders Apply button after fields load', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    })
})

test('renders prompt when no search has been run', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => {
        expect(screen.getByText('Configure filters and click Apply to search.')).toBeInTheDocument()
    })
})

// ---------------------------------------------------------------------------
// Adding and removing filters
// ---------------------------------------------------------------------------

test('adds a filter row when Add Filter is clicked', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))

    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()
})

test('removes a filter row when Remove is clicked', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.queryByRole('combobox', { name: 'Select filter field' })).not.toBeInTheDocument()
})

test('disables Add Filter when all fields are active', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    // Add one filter for each field in MOCK_FIELDS (4 total)
    for (let i = 0; i < MOCK_FIELDS.length; i++) {
        fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    }

    expect(screen.getByRole('button', { name: 'Add Filter' })).toBeDisabled()
})

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

test('shows validation error when filter has no field selected', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('All filters must have a field selected')
})

test('shows validation error when string filter has empty value', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Select filter field' }), {
        target: { value: 'name' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Name requires a value')
})

test('shows validation error when enum filter has no selection', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Select filter field' }), {
        target: { value: 'race' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Race requires at least one selection')
})

test('does not call fetchCharacterSearch when validation fails', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(fetchCharacterSearch).not.toHaveBeenCalled()
})

// ---------------------------------------------------------------------------
// Successful search
// ---------------------------------------------------------------------------

test('calls fetchCharacterSearch with empty filters when no filters added', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(fetchCharacterSearch).toHaveBeenCalledWith([], 100)
    })
})

test('renders results table after successful search', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.getByText('Ungagan')).toBeInTheDocument()
        expect(screen.getByText('Granie')).toBeInTheDocument()
    })
})

test('shows no results message when search returns empty rows', async () => {
    fetchCharacterSearch.mockResolvedValue({ columns: ['name'], rows: [] })
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
})

test('hides prompt after search completes', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.queryByText('Configure filters and click Apply to search.')).not.toBeInTheDocument()
    })
})

// ---------------------------------------------------------------------------
// Search error
// ---------------------------------------------------------------------------

test('shows search error when fetchCharacterSearch rejects', async () => {
    fetchCharacterSearch.mockRejectedValue(new Error('500'))
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Search error: 500')
    })
})

// ---------------------------------------------------------------------------
// Limit input
// ---------------------------------------------------------------------------

test('renders limit input with default value', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('spinbutton', { name: 'Result limit' }))
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(100)
})

test('passes limit to fetchCharacterSearch', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('spinbutton', { name: 'Result limit' }))

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Result limit' }), {
        target: { value: '50' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(fetchCharacterSearch).toHaveBeenCalledWith([], 50)
    })
})

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

test('reset removes all filter rows', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Add Filter' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Filter' }))
    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByRole('combobox', { name: 'Select filter field' })).not.toBeInTheDocument()
})

test('reset clears results and restores prompt', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => screen.getByText('Ungagan'))

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByText('Ungagan')).not.toBeInTheDocument()
    expect(screen.getByText('Configure filters and click Apply to search.')).toBeInTheDocument()
})

test('reset restores limit to default', async () => {
    render(<DBSearchPanel />)
    await waitFor(() => screen.getByRole('spinbutton', { name: 'Result limit' }))

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Result limit' }), {
        target: { value: '50' }
    })
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(50)

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(100)
})
