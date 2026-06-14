import { useState, useRef } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
import { CollapseHandle } from './CollapseHandle'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { formatTime, formatTimestamp } from '../utils/format'
import { ALLIANCE_RACES, HORDE_RACES, ALLIANCE_CLASSES, HORDE_CLASSES, ALL_CLASSES, FACTION_COLORS, CLASS_COLORS } from '../constants/wow'

export function LeaderboardPanel() {
    const [faction, setFaction] = useState('')
    const [characterClass, setCharacterClass] = useState('')
    const [topOpen, setTopOpen] = useState(true)
    const controlsRef = useRef(null)
    useClickOutside(controlsRef, () => setTopOpen(false))
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

    return (
        <div className="panel-root">
            <h2>Leaderboard</h2>

            <div ref={controlsRef}>
                {topOpen && (
                    <div className="panel-controls" style={{ height: 'auto', overflowY: 'visible' }}>
                        <div className="panel-controls-content">
                            <fieldset>
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
                            </fieldset>
                        </div>
                    </div>
                )}
                <CollapseHandle
                    orientation="horizontal"
                    isOpen={topOpen}
                    onToggle={() => setTopOpen(o => !o)}
                />
            </div>

            <div className="content-wrapper" style={{ overflowY: 'auto' }}>
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
                            <th>Time Played</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((entry, i) => (
                            <tr key={entry.name}>
                                <td>{i + 1}</td>
                                <td>{entry.name}</td>
                                <td>{entry.level}</td>
                                <td style={{ color: FACTION_COLORS[ALLIANCE_RACES.includes(entry.race) ? 'Alliance' : 'Horde'] }}>
                                    <img
                                        src={`${import.meta.env.BASE_URL}icons/factions/${ALLIANCE_RACES.includes(entry.race) ? 'Alliance' : 'Horde'}.svg`}
                                        alt={ALLIANCE_RACES.includes(entry.race) ? 'Alliance' : 'Horde'}
                                        width={32}
                                        height={32}
                                        style={{ verticalAlign: 'middle', marginRight: '12px' }}
                                    />
                                    {entry.race}
                                </td>
                                <td style={{ color: CLASS_COLORS[entry.class] }}>
                                    <img
                                        src={`${import.meta.env.BASE_URL}icons/classes/${entry.class}.svg`}
                                        alt={entry.class}
                                        width={32}
                                        height={32}
                                        style={{ verticalAlign: 'middle', marginRight: '12px' }}
                                    />
                                    {entry.class}
                                </td>
                                <td>{entry.online ? 'Yes' : 'No'}</td>
                                <td>{formatTimestamp(entry.ding_time)}</td>
                                <td>{formatTime(entry.efficiency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
