import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { CharacterSearchPanel } from './CharacterSearchPanel'
import { fetchCharacterFields, fetchCharacterSearch } from '../api/characterSearch'

vi.mock('../api/characterSearch')
vi.mock('../constants/characterQuickSearches', () => ({
    QUICK_SEARCHES: [
        {
            label: 'Test Preset',
            filters: [
                { id: -1, field: 'lifetime_honorable_kills', op: 'range', value: '', min: 1, max: '', values: [] },
            ],
            orderBy: 'lifetime_honorable_kills',
            orderDir: 'desc',
            limit: 20,
            visibleCols: ['name', 'level']
        }
    ]
}))

const MOCK_FIELDS = [
    { field: 'name',   type: 'string',  label: 'Name' },
    { field: 'level',  type: 'range',   label: 'Level', min: 1, max: 60 },
    { field: 'race',   type: 'enum',    label: 'Race',  values: ['Human', 'Orc'] },
    { field: 'online', type: 'boolean', label: 'Online' },
    { field: 'zone', type: 'string_in', label: 'Zone' },
    { field: 'lifetime_honorable_kills', type: 'range', label: 'Lifetime Kills', min: 0 },
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
    render(<CharacterSearchPanel />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('shows error when fields fetch fails', async () => {
    fetchCharacterFields.mockRejectedValue(new Error('503'))
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByText('Error loading fields: 503')).toBeInTheDocument()
    })
})

// ---------------------------------------------------------------------------
// Rendered state after fields load
// ---------------------------------------------------------------------------

test('renders heading after fields load', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByText('Character Search')).toBeInTheDocument()
    })
})

test('renders Add filter dropdown after fields load', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Add filter' })).toBeInTheDocument()
    })
})

test('renders Apply button after fields load', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    })
})

test('renders prompt when no search has been run', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByText('Configure filters and click Apply to search.')).toBeInTheDocument()
    })
})

// ---------------------------------------------------------------------------
// Adding and removing filters
// ---------------------------------------------------------------------------

test('adds a filter row when field selected from Add filter dropdown', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'name' }
    })

    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()
})

test('removes a filter row when Remove is clicked', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'name' }
    })
    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.queryByRole('combobox', { name: 'Select filter field' })).not.toBeInTheDocument()
})

test('disables Add filter dropdown when all fields are active', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    for (const f of MOCK_FIELDS) {
        fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
            target: { value: f.field }
        })
    }

    expect(screen.getByRole('combobox', { name: 'Add filter' })).toBeDisabled()
})

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

test('shows validation error when string filter has empty value', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'name' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Name requires a value')
})

test('shows validation error when string_in filter has no values', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'zone' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Zone requires at least one value')
})

test('shows validation error when enum filter has no selection', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'race' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Race requires at least one selection')
})

test('passes string_in values as op:in payload to fetchCharacterSearch', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'zone' }
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Zone 1' }), {
        target: { value: 'Ironforge' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(fetchCharacterSearch).toHaveBeenCalledWith(
            [{ field: 'zone', op: 'in', values: ['Ironforge'] }],
            100, '', 'asc'
        )
    })
})

test('does not call fetchCharacterSearch when validation fails', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'name' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(fetchCharacterSearch).not.toHaveBeenCalled()
})

// ---------------------------------------------------------------------------
// Successful search
// ---------------------------------------------------------------------------

test('calls fetchCharacterSearch with empty filters when no filters added', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
        expect(fetchCharacterSearch).toHaveBeenCalledWith([], 100, '', 'asc')
    })
})

test('renders results table after successful search', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.getByText('Ungagan')).toBeInTheDocument()
        expect(screen.getByText('Granie')).toBeInTheDocument()
    })
})

test('shows no results message when search returns empty rows', async () => {
    fetchCharacterSearch.mockResolvedValue({ columns: ['name'], rows: [] })
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
})

test('hides prompt after search completes', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.queryByText('Configure filters and click Apply to search.')).not.toBeInTheDocument()
    })
})

test('page size persists across searches', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => screen.getByRole('combobox', { name: 'Page size' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Page size' }), {
        target: { value: '10' }
    })
    expect(screen.getByRole('combobox', { name: 'Page size' })).toHaveValue('10')

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => screen.getByRole('combobox', { name: 'Page size' }))

    expect(screen.getByRole('combobox', { name: 'Page size' })).toHaveValue('10')
})

// ---------------------------------------------------------------------------
// Search error
// ---------------------------------------------------------------------------

test('shows search error when fetchCharacterSearch rejects', async () => {
    fetchCharacterSearch.mockRejectedValue(new Error('500'))
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Search error: 500')
    })
})

test('shows validation error when string_in filter exceeds max values', async () => {
    fetchCharacterSearch.mockResolvedValue(MOCK_RESULT)
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'zone' }
    })

    // fill 10 zone inputs to cap
    for (let i = 1; i <= 10; i++) {
        fireEvent.change(screen.getByRole('textbox', { name: `Zone ${i}` }), {
            target: { value: `Zone${i}` }
        })
    }

    expect(screen.queryByRole('textbox', { name: 'Zone 11' })).not.toBeInTheDocument()
})

// ---------------------------------------------------------------------------
// Order by
// ---------------------------------------------------------------------------

test('renders Order by dropdown after fields load', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Order by field' })).toBeInTheDocument()
    })
})

test('Order direction is disabled when no order field selected', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Order direction' })).toBeDisabled()
    })
})

test('Order direction enabled when order field selected', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Order by field' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Order by field' }), {
        target: { value: 'level' }
    })

    expect(screen.getByRole('combobox', { name: 'Order direction' })).not.toBeDisabled()
})

test('passes order_by and order_dir to fetchCharacterSearch', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Order by field' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Order by field' }), {
        target: { value: 'level' }
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Order direction' }), {
        target: { value: 'desc' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
        expect(fetchCharacterSearch).toHaveBeenCalledWith([], 100, 'level', 'desc')
    })
})

// ---------------------------------------------------------------------------
// Limit input
// ---------------------------------------------------------------------------

test('renders limit input with default value', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('spinbutton', { name: 'Result limit' }))
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(100)
})

test('passes limit to fetchCharacterSearch', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('spinbutton', { name: 'Result limit' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Result limit' }), {
        target: { value: '50' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
        expect(fetchCharacterSearch).toHaveBeenCalledWith([], 50, '', 'asc')
    })
})

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

test('reset removes all filter rows', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'name' }
    })
    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByRole('combobox', { name: 'Select filter field' })).not.toBeInTheDocument()
})

test('reset clears results and restores prompt', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => screen.getByText('Ungagan'))

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByText('Ungagan')).not.toBeInTheDocument()
    expect(screen.getByText('Configure filters and click Apply to search.')).toBeInTheDocument()
})

test('reset restores limit to default', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('spinbutton', { name: 'Result limit' }))

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Result limit' }), {
        target: { value: '50' }
    })
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(50)

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(100)
})

test('reset clears order by selection', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Order by field' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Order by field' }), {
        target: { value: 'level' }
    })
    expect(screen.getByRole('combobox', { name: 'Order by field' })).toHaveValue('level')

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('combobox', { name: 'Order by field' })).toHaveValue('')
})

test('reset clears quick search state', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Quick search' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Quick search' }), {
        target: { value: 'Test Preset' }
    })
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(20)

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(100)
    expect(screen.getByRole('combobox', { name: 'Order by field' })).toHaveValue('')
})

// ---------------------------------------------------------------------------
// Quick search
// ---------------------------------------------------------------------------

test('renders quick search dropdown', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Quick search' })).toBeInTheDocument()
    })
})

test('quick search populates filters and settings', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Quick search' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Quick search' }), {
        target: { value: 'Test Preset' }
    })

    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Order by field' })).toHaveValue('lifetime_honorable_kills')
    expect(screen.getByRole('combobox', { name: 'Order direction' })).toHaveValue('desc')
    expect(screen.getByRole('spinbutton', { name: 'Result limit' })).toHaveValue(20)
})

test('quick search clears existing filters', async () => {
    render(<CharacterSearchPanel />)
    await waitFor(() => screen.getByRole('combobox', { name: 'Add filter' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Add filter' }), {
        target: { value: 'name' }
    })
    expect(screen.getAllByRole('combobox', { name: 'Select filter field' }).length).toBe(1)

    fireEvent.change(screen.getByRole('combobox', { name: 'Quick search' }), {
        target: { value: 'Test Preset' }
    })

    expect(screen.getAllByRole('combobox', { name: 'Select filter field' }).length).toBe(1)
    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toHaveValue('lifetime_honorable_kills')
})
