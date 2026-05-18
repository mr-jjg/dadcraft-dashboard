export async function fetchCharacterFields() {
    const res = await fetch('/api/character/fields')
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
}

export async function fetchCharacterSearch(filters, limit, orderBy, orderDir) {
    const res = await fetch('/api/character/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filters,
            limit,
            ...(orderBy ? { order_by: orderBy, order_dir: orderDir } : {}),
        }),
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
}
