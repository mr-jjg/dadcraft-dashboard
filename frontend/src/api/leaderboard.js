export async function fetchLeaderboard(sort) {
    const qs = sort ? `?${new URLSearchParams({ sort })}` : ''
    const res = await fetch(`/api/leaderboard${qs}`)
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
}
