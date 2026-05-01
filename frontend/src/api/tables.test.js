import { expect, vi } from 'vitest'
import { fetchTable } from './tables'

test('returns table values on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
            columns: ['Race', 'Count'],
            rows: [['Human', '42'], ['Orc', '38']]
        })
    })

    const result = await fetchTable('/api/metric')
    expect(result).toEqual({
        columns: ['Race', 'Count'],
        rows: [['Human', '42'], ['Orc', '38']]
    })
})

test('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
    })

    await expect(fetchTable('/api/table')).rejects.toThrow('500')
})

test('throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    await expect(fetchTable('/api/table')).rejects.toThrow('network error')
})

test('fetches from the provided endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 75.0 })
    })

    await fetchTable('/api/table')

    expect(global.fetch).toHaveBeenCalledWith('/api/table')
})
