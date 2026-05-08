import { useLeaderboard } from '../hooks/useLeaderboard'
import { formatTime, formatDingTime } from '../utils/format'

export function LeaderboardPanel() {
    const { entries, error } = useLeaderboard()

    if (error) return <div>Error: {error.message}</div>
    if (!entries) return <div>Loading...</div>
    if (entries.length === 0) return <div>No leaderboard data yet.</div>

    return (
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Race</th>
                    <th>Class</th>
                    <th>Online</th>
                    <th>Ding Date</th>
                    <th>Efficiency</th>
                </tr>
            </thead>
            <tbody>
                {entries.map((entry, i) => (
                    <tr key={entry.name}>
                        <td>{i + 1}</td>
                        <td>{entry.name}</td>
                        <td>{entry.level}</td>
                        <td>{entry.race}</td>
                        <td>{entry.class}</td>
                        <td>{entry.online ? 'Yes' : 'No'}</td>
                        <td>{formatDingTime(entry.ding_time)}</td>
                        <td>{formatTime(entry.efficiency)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
