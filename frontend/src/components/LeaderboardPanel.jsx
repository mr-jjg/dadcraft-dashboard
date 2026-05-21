import { useState } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { formatTime, formatTimestamp } from '../utils/format'
import { ALLIANCE_RACES, HORDE_RACES, ALLIANCE_CLASSES, HORDE_CLASSES, ALL_CLASSES, CLASS_COLORS } from '../utils/wow'

export function LeaderboardPanel() {
    const [faction, setFaction] = useState('')
    const [characterClass, setCharacterClass] = useState('')
    const { entries, error } = useLeaderboard()

    const availableClasses = faction === 'alliance' ? ALLIANCE_CLASSES
                           : faction === 'horde'    ? HORDE_CLASSES
                           : ALL_CLASSES

    const handleFactionChange = (newFaction) => {
        const validClasses = newFaction === 'alliance' ? ALLIANCE_CLASSES
                           : newFaction === 'horde'    ? HORDE_CLASSES
                           : ALL_CLASSES
        setFaction(newFaction)
        setCharacterClass(prev => validClasses.includes(prev) ? prev : '')
    }

    if (error) return <div>Error: {error.message}</div>
    if (!entries) return <div>Loading...</div>
    if (entries.length === 0) return <div>No leaderboard data yet.</div>

    const filtered = entries
        .filter(e => !faction || (faction === 'alliance' ? ALLIANCE_RACES.includes(e.race) : HORDE_RACES.includes(e.race)))
        .filter(e => !characterClass || e.class === characterClass)
        .slice(0, 20)

    const factionColor = (race) => ALLIANCE_RACES.includes(race) ? '#00aaff' : '#cc2200'

    return (
        <div>
            <h2>Leaderboard</h2>
            <label>
                Faction
                <select value={faction} onChange={e => handleFactionChange(e.target.value)}>
                    <option value="">All</option>
                    <option value="alliance">Alliance</option>
                    <option value="horde">Horde</option>
                </select>
            </label>
            <label>
                Class
                <select value={characterClass} onChange={e => setCharacterClass(e.target.value)}>
                    <option value="">All</option>
                    {availableClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
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
                            <td style={{ color: factionColor(entry.race) }}>{entry.race}</td>
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
