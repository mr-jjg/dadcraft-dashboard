import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CharacterFilterRow } from './CharacterFilterRow'

const FIELDS = [
    { field: 'name',   type: 'string',  label: 'Name' },
    { field: 'level',  type: 'range',   label: 'Level', min: 1, max: 60 },
    { field: 'race',   type: 'enum',    label: 'Race',  values: ['Human', 'Orc'] },
    { field: 'online', type: 'boolean', label: 'Online' },
    { field: 'zone', type: 'string_in', label: 'Zone' },
]

function emptyFilter(field = '') {
    return { id: 1, field, value: '', min: '', max: '', values: [] }
}

// ---------------------------------------------------------------------------
// Field selector
// ---------------------------------------------------------------------------

test('renders field selector', () => {
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('combobox', { name: 'Select filter field' })).toBeInTheDocument()
})

test('renders all field labels as options', () => {
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Race' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Online' })).toBeInTheDocument()
})

test('disables fields that are already in use', () => {
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set(['level'])}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('option', { name: 'Level' })).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Name' })).not.toBeDisabled()
})

test('does not disable own field even if in usedFields', () => {
    render(<CharacterFilterRow
        filter={emptyFilter('name')}
        fields={FIELDS}
        usedFields={new Set(['name'])}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('option', { name: 'Name' })).not.toBeDisabled()
})

test('calls onChange with reset values when field changes', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Select filter field' }), {
        target: { value: 'name' }
    })
    expect(onChange).toHaveBeenCalledWith(1, {
        field: 'name', value: '', min: '', max: '', values: []
    })
})

test('calls onChange with boolean default when field changes to boolean type', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter('name')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Select filter field' }), {
        target: { value: 'online' }
    })
    expect(onChange).toHaveBeenCalledWith(1, {
        field: 'online', value: '1', min: '', max: '', values: []
    })
})

// ---------------------------------------------------------------------------
// No control rendered until field selected
// ---------------------------------------------------------------------------

test('renders no control when no field is selected', () => {
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
})

// ---------------------------------------------------------------------------
// String control
// ---------------------------------------------------------------------------

test('renders text input for string field', () => {
    render(<CharacterFilterRow
        filter={emptyFilter('name')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
})

test('calls onChange when string input changes', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter('name')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Aeth' } })
    expect(onChange).toHaveBeenCalledWith(1, { value: 'Aeth' })
})

// ---------------------------------------------------------------------------
// String-in control
// ---------------------------------------------------------------------------

test('renders one empty input for string_in field', () => {
    render(<CharacterFilterRow
        filter={emptyFilter('zone')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getAllByRole('textbox').length).toBe(1)
    expect(screen.getByRole('textbox', { name: 'Zone 1' })).toHaveValue('')
})

test('renders additional input for each existing value plus one empty', () => {
    render(<CharacterFilterRow
        filter={{ id: 1, field: 'zone', value: '', min: '', max: '', values: ['Stranglethorn Vale'] }}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getAllByRole('textbox').length).toBe(2)
    expect(screen.getByRole('textbox', { name: 'Zone 1' })).toHaveValue('Stranglethorn Vale')
    expect(screen.getByRole('textbox', { name: 'Zone 2' })).toHaveValue('')
})

test('calls onChange with new value when string_in input changes', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter('zone')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Zone 1' }), {
        target: { value: 'Ironforge' }
    })
    expect(onChange).toHaveBeenCalledWith(1, { values: ['Ironforge'] })
})

test('clearing a string_in input removes it from values', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={{ id: 1, field: 'zone', value: '', min: '', max: '', values: ['Ironforge'] }}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Zone 1' }), {
        target: { value: '' }
    })
    expect(onChange).toHaveBeenCalledWith(1, { values: [] })
})

// ---------------------------------------------------------------------------
// Range control
// ---------------------------------------------------------------------------

test('renders min and max inputs for range field', () => {
    render(<CharacterFilterRow
        filter={emptyFilter('level')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('spinbutton', { name: 'Level min' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level max' })).toBeInTheDocument()
})

test('calls onChange when min changes', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter('level')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Level min' }), { target: { value: '20' } })
    expect(onChange).toHaveBeenCalledWith(1, { min: '20' })
})

test('calls onChange when max changes', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter('level')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Level max' }), { target: { value: '40' } })
    expect(onChange).toHaveBeenCalledWith(1, { max: '40' })
})

// ---------------------------------------------------------------------------
// Enum control
// ---------------------------------------------------------------------------

test('renders checkboxes for enum field', () => {
    render(<CharacterFilterRow
        filter={emptyFilter('race')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByLabelText('Human')).toBeInTheDocument()
    expect(screen.getByLabelText('Orc')).toBeInTheDocument()
})

test('calls onChange with added value when checkbox checked', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter('race')}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.click(screen.getByLabelText('Human'))
    expect(onChange).toHaveBeenCalledWith(1, { values: ['Human'] })
})

test('calls onChange with removed value when checkbox unchecked', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={{ id: 1, field: 'race', value: '', min: '', max: '', values: ['Human', 'Orc'] }}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.click(screen.getByLabelText('Human'))
    expect(onChange).toHaveBeenCalledWith(1, { values: ['Orc'] })
})

// ---------------------------------------------------------------------------
// Boolean control
// ---------------------------------------------------------------------------

test('renders Yes/No radio buttons for boolean field', () => {
    render(<CharacterFilterRow
        filter={{ id: 1, field: 'online', value: '1', min: '', max: '', values: [] }}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No' })).toBeInTheDocument()
})

test('calls onChange when boolean radio changes', () => {
    const onChange = vi.fn()
    render(<CharacterFilterRow
        filter={{ id: 1, field: 'online', value: '1', min: '', max: '', values: [] }}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={onChange}
        onRemove={vi.fn()}
    />)
    fireEvent.click(screen.getByRole('radio', { name: 'No' }))
    expect(onChange).toHaveBeenCalledWith(1, { value: '0' })
})

test('Yes radio is checked by default', () => {
    render(<CharacterFilterRow
        filter={{ id: 1, field: 'online', value: '1', min: '', max: '', values: [] }}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'No' })).not.toBeChecked()
})

// ---------------------------------------------------------------------------
// Remove button
// ---------------------------------------------------------------------------

test('renders remove button', () => {
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={vi.fn()}
    />)
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
})

test('calls onRemove with filter id when ✕ clicked', () => {
    const onRemove = vi.fn()
    render(<CharacterFilterRow
        filter={emptyFilter()}
        fields={FIELDS}
        usedFields={new Set()}
        onChange={vi.fn()}
        onRemove={onRemove}
    />)
    fireEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(onRemove).toHaveBeenCalledWith(1)
})
