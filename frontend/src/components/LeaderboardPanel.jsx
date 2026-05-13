import { useState } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { formatTime, formatTimestamp } from '../utils/format'
import { ALLIANCE_RACES, HORDE_RACES, CLASS_COLORS } from '../utils/wow'

export function LeaderboardPanel() {
    const [faction, setFaction] = useState('')
    const { entries, error } = useLeaderboard()

    if (error) return <div>Error: {error.message}</div>
    if (!entries) return <div>Loading...</div>
    if (entries.length === 0) return <div>No leaderboard data yet.</div>

    const filtered = (faction === 'alliance' ? entries.filter(e => ALLIANCE_RACES.includes(e.race))
                    : faction === 'horde'    ? entries.filter(e => HORDE_RACES.includes(e.race))
                    : entries).slice(0, 20);

    const factionColor = (race) => ALLIANCE_RACES.includes(race) ? '#00aaff' : '#cc2200'

    return (
        <div>
            <h2>Leaderboard</h2>
            <label>
                Faction
                <select onChange={e => setFaction(e.target.value)}>
                    <option value="">All</option>
                    <option value="alliance">Alliance</option>
                    <option value="horde">Horde</option>
                </select>
            </label>
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
                    {filtered.map((entry, i) => (
                        <tr key={entry.name}>
                            <td>{i + 1}</td>
                            <td>{entry.name}</td>
                            <td>{entry.level}</td>
                            <td style= {{ color: factionColor(entry.race) }}>{entry.race}</td>
                            <td style={{ color: CLASS_COLORS[entry.class] }}>{entry.class}</td>
                            <td>{entry.online ? 'Yes' : 'No'}</td>
                            <td>{formatTimestamp(entry.ding_time)}</td>
                            <td>{formatTime(entry.efficiency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
