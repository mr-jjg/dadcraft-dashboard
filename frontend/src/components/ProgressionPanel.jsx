import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useProgression } from '../hooks/useProgression';
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps';

const ALLIANCE_RACES   = ['Human', 'Dwarf', 'Night Elf', 'Gnome'];
const HORDE_RACES      = ['Orc', 'Undead', 'Tauren', 'Troll'];
const ALL_RACES        = [...ALLIANCE_RACES, ...HORDE_RACES];

const ALLIANCE_CLASSES = ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Warlock', 'Druid'];
const HORDE_CLASSES    = ['Warrior', 'Shaman', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Warlock', 'Druid'];
const ALL_CLASSES      = ['Warrior','Paladin','Hunter','Rogue','Priest','Shaman','Mage','Warlock','Druid'];

const CLASS_COLORS = {
    Warrior: '#C79C6E',
    Paladin: '#F58CBA',
    Hunter:  '#ABD473',
    Rogue:   '#FFF569',
    Priest:  '#F0EEE0', // '#FFFFFF'
    Shaman:  '#0070DE',
    Mage:    '#69CCF0',
    Warlock: '#9482C9',
    Druid:   '#FF7D0A',
};

export function ProgressionPanel() {
    const { timestamps } = useProgressionTimestamps();

    const [time, setTime] = useState(null);
    const [online, setOnline] = useState('');
    const [faction, setFaction] = useState('');
    const [race, setRace] = useState('');
    const [characterClass, setCharacterClass] = useState('');

    const availableRaces   = faction === 'alliance' ? ALLIANCE_RACES : faction === 'horde'    ? HORDE_RACES : ALL_RACES;
    const availableClasses = faction === 'alliance' ? ALLIANCE_CLASSES : faction === 'horde'    ? HORDE_CLASSES : ALL_CLASSES;

    const { progression, error } = useProgression(
        time || timestamps[timestamps.length - 1],
        online,
        faction,
        race,
        characterClass
    );

    // transform [{Labels:{level,class}, Value}] into recharts format
    // [{level: '1', Warrior: 2, Mage: 1, ...}, ...]
    const chartData = {};
    (progression || []).forEach(({ Labels, Value }) => {
        const lvl = Labels.level;
        if (!chartData[lvl]) chartData[lvl] = { level: lvl };
        chartData[lvl][Labels.class] = Value;
    });
    const data = Object.values(chartData).sort((a, b) => Number(a.level) - Number(b.level));

    return (
        <div>
            <h2>Population Progression</h2>

            <label>
                Online only
                <input type="checkbox" onChange={e => setOnline(e.target.checked ? 'true' : '')} />
            </label>

            <label>
                Faction
                <select onChange={e => {
                    const newFaction = e.target.value;
                    setFaction(newFaction);
                    setRace('');
                    if (newFaction === 'alliance' && !ALLIANCE_CLASSES.includes(characterClass)) {
                        setCharacterClass('');
                    }
                    if (newFaction === 'horde' && !HORDE_CLASSES.includes(characterClass)) {
                        setCharacterClass('');
                    }
                }}>
                    <option value="">All</option>
                    <option value="alliance">Alliance</option>
                    <option value="horde">Horde</option>
                </select>
            </label>

            <label>
                Time
                <input
                    type="range"
                    min={0}
                    max={timestamps.length - 1}
                    onChange={e => setTime(timestamps[Number(e.target.value)])}
                />
            </label>

            <label>
                Race
                <select onChange={e => setRace(e.target.value)}>
                    <option value="">All</option>
                    {availableRaces.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </label>

            <label>
                Class
                <select onChange={e => setCharacterClass(e.target.value)}>
                    <option value="">All</option>
                    {availableClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </label>

            {error && <p>Error loading progression data</p>}

            <BarChart width={800} height={400} data={data}>
                <XAxis dataKey="level" type="number" domain={[1, 60]} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {ALL_CLASSES.map(cls => (
                    <Bar key={cls} dataKey={cls} stackId="a" fill={CLASS_COLORS[cls]} />
                ))}
            </BarChart>
        </div>
    );
}