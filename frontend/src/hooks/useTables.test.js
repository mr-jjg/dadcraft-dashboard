import { expect, test, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTable } from './useTables'
import { fetchTable } from '../api/tables'

vi.mock('../api/tables')

test('returns Table on success', async () => {
    fetchTable.mockResolvedValue({
        columns: ['Race', 'Count'],
        rows: [['Human', '42'], ['Orc', '38']]
    })

    const { result } = renderHook(() => useTable('api/table'))

    await waitFor(() => {
        expect(result.current.table).toEqual({
            columns: ['Race', 'Count'],
            rows: [['Human', '42'], ['Orc', '38']]
        })
    })
})

test('returns error on failure', async () => {
    fetchTable.mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useTable('/api/table'))

    await waitFor(() => {
        expect(result.current.error).toEqual(new Error('500'))
    })
})
