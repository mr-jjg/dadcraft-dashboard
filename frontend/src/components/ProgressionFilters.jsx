import { useState } from 'react';
import { ALLIANCE_RACES, HORDE_RACES, ALL_RACES, ALLIANCE_CLASSES, HORDE_CLASSES, ALL_CLASSES } from '../utils/wow';
import { useTable } from '../hooks/useTables';

export function ProgressionFilters({ onChange }) {
    const [online, setOnline] = useState('');
    const [faction, setFaction] = useState('');
    const [race, setRace] = useState('');
    const [characterClass, setCharacterClass] = useState('');
    const [guild, setGuild] = useState('');

    const { table: guildsTable } = useTable('/api/db/guilds/names');
    const availableGuilds = guildsTable ? guildsTable.rows.map(r => r[0]) : [];
    const availableRaces   = faction === 'alliance' ? ALLIANCE_RACES : faction === 'horde' ? HORDE_RACES : ALL_RACES;
    const availableClasses = faction === 'alliance' ? ALLIANCE_CLASSES : faction === 'horde' ? HORDE_CLASSES : ALL_CLASSES;

    const emit = (updates) => {
        const next = { online, faction, race, characterClass, guild, ...updates };
        onChange(next);
    }

    const handleFactionChange = (newFaction) => {
        const newClass = newFaction === 'alliance' && !ALLIANCE_CLASSES.includes(characterClass) ? '' :
                         newFaction === 'horde'    && !HORDE_CLASSES.includes(characterClass)    ? '' :
                         characterClass;
        setFaction(newFaction);
        setRace('');
        setCharacterClass(newClass);
        emit({ faction: newFaction, race: '', characterClass: newClass });
    }

    return (
        <div>
            <label>
                Online only
                <input type="checkbox" onChange={e => {
                    const val = e.target.checked ? 'true' : '';
                    setOnline(val);
                    emit({ online: val });
                }} />
            </label>

            <label>
                Faction
                <select onChange={e => handleFactionChange(e.target.value)}>
                    <option value="">All</option>
                    <option value="alliance">Alliance</option>
                    <option value="horde">Horde</option>
                </select>
            </label>

            <label>
                Race
                <select value={race} onChange={e => {
                    setRace(e.target.value);
                    emit({ race: e.target.value });
                }}>
                    <option value="">All</option>
                    {availableRaces.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </label>

            <label>
                Class
                <select value={characterClass} onChange={e => {
                    setCharacterClass(e.target.value);
                    emit({ characterClass: e.target.value });
                }}>
                    <option value="">All</option>
                    {availableClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </label>

            <label>
                Guild
                <select onChange={e => {
                    setGuild(e.target.value);
                    emit({ guild: e.target.value });
                }}>
                    <option value="">All</option>
                    <option value="None">Unguilded</option>
                    {availableGuilds.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </label>
        </div>
    )
}