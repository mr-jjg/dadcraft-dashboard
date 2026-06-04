import { ALLIANCE_RACES, HORDE_RACES, ALL_RACES, ALLIANCE_CLASSES, HORDE_CLASSES, ALL_CLASSES, CLASS_RACES, RACE_CLASSES } from '../constants/wow';
import { useTable } from '../hooks/useTables';

export function ProgressionFilters({ filters, onChange }) {
    const { online, faction, race, characterClass, guild } = filters

    const availableRaces = characterClass && CLASS_RACES[characterClass]
        ? CLASS_RACES[characterClass]
        : faction === 'alliance' ? ALLIANCE_RACES
        : faction === 'horde' ? HORDE_RACES
        : ALL_RACES;

    const availableClasses = race && RACE_CLASSES[race]
        ? RACE_CLASSES[race]
        : faction === 'alliance' ? ALLIANCE_CLASSES
        : faction === 'horde'    ? HORDE_CLASSES
        : ALL_CLASSES;

    const { table: guildsTable } = useTable('/api/db/guilds/names');
    const availableGuilds = guildsTable ? guildsTable.rows.map(r => r[0]) : [];

    const emit = (updates) => {
        onChange({ ...filters, ...updates })
    }

    const handleFactionChange = (newFaction) => {
        const newClass = newFaction === 'alliance' && !ALLIANCE_CLASSES.includes(characterClass) ? '' :
                        newFaction === 'horde'    && !HORDE_CLASSES.includes(characterClass)    ? '' :
                        characterClass;
        emit({ faction: newFaction, race: '', characterClass: newClass });
    }

    const handleRaceChange = (newRace) => {
        const validClasses = newRace ? RACE_CLASSES[newRace] : ALL_CLASSES;
        const newClass = validClasses.includes(characterClass) ? characterClass : '';
        emit({ race: newRace, characterClass: newClass });
    }

    const handleClassChange = (newClass) => {
        const validRaces = newClass ? CLASS_RACES[newClass] : ALL_RACES;
        const newRace = validRaces.includes(race) ? race : '';
        emit({ characterClass: newClass, race: newRace });
    }

    return (
        <div className="progression-filters">
            <label>
                Online
                <select className="filter-select" value={online} aria-label="Online filter" onChange={e => emit({ online: e.target.value })}>
                    <option value="">All</option>
                    <option value="true">Online</option>
                    <option value="false">Offline</option>
                </select>
            </label>

            <label>
                Faction
                <select className="filter-select" value={faction} aria-label="Faction filter" onChange={e => handleFactionChange(e.target.value)}>
                    <option value="">All</option>
                    <option value="alliance">Alliance</option>
                    <option value="horde">Horde</option>
                </select>
            </label>

            <label>
                Race
                <select className="filter-select" value={race} aria-label="Race filter" onChange={e => handleRaceChange(e.target.value)}>
                    <option value="">All</option>
                    {availableRaces.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </label>

            <label>
                Class
                <select className="filter-select" value={characterClass} aria-label="Class filter" onChange={e => handleClassChange(e.target.value)}>
                    <option value="">All</option>
                    {availableClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </label>

            <label>
                Guild
                <select className="filter-select" value={guild} aria-label="Guild filter" onChange={e => {
                    emit({ guild: e.target.value })
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
