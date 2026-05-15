import { expect, vi } from 'vitest'
import { fetchCharacterFields, fetchCharacterSearch } from './characterSearch'

// ---------------------------------------------------------------------------
// fetchCharacterFields
// ---------------------------------------------------------------------------

test('fetchCharacterFields returns field definitions on success', async () => {
    const fields = [{ field: 'name', type: 'string', label: 'Name' }]
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => fields,
    })

    const result = await fetchCharacterFields()
    expect(result).toEqual(fields)
    expect(global.fetch).toHaveBeenCalledWith('/api/character/fields')
})

test('fetchCharacterFields throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchCharacterFields()).rejects.toThrow('500')
})

test('fetchCharacterFields throws on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    await expect(fetchCharacterFields()).rejects.toThrow('network error')
})

// ---------------------------------------------------------------------------
// fetchCharacterSearch
// ---------------------------------------------------------------------------

test('fetchCharacterSearch returns table result on success', async () => {
    const result = { columns: ['name'], rows: [['Ungagan']] }
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => result,
    })

    const filters = [{ field: 'name', op: 'like', value: 'Unga' }]
    const data = await fetchCharacterSearch(filters, 10)
    expect(data).toEqual(result)
})

test('fetchCharacterSearch sends POST to correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ columns: [], rows: [] }),
    })

    await fetchCharacterSearch([], 100)
    expect(global.fetch).toHaveBeenCalledWith(
        '/api/character/search',
        expect.objectContaining({ method: 'POST' })
    )
})

test('fetchCharacterSearch sends correct JSON body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ columns: [], rows: [] }),
    })

    const filters = [{ field: 'online', op: 'eq', value: '1' }]
    await fetchCharacterSearch(filters, 50)

    const [, init] = global.fetch.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.filters).toEqual(filters)
    expect(body.limit).toBe(50)
})

test('fetchCharacterSearch throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    await expect(fetchCharacterSearch([], 10)).rejects.toThrow('400')
})

test('fetchCharacterSearch throws on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    await expect(fetchCharacterSearch([], 10)).rejects.toThrow('network error')
})
