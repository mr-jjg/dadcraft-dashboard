export async function fetchLeaderboard() {
    const res = await fetch('/api/leaderboard')
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
}
