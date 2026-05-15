export async function fetchCharacterFields() {
    const res = await fetch('/api/character/fields')
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
}

export async function fetchCharacterSearch(filters, limit) {
    const res = await fetch('/api/character/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, limit }),
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
}
