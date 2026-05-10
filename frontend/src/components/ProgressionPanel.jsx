import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ProgressionFilters } from './ProgressionFilters';
import { ProgressionTimeline } from './ProgressionTimeline';
import { useProgression } from '../hooks/useProgression';
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps';
import { ALL_CLASSES, CLASS_COLORS } from '../utils/wow';

export function ProgressionPanel() {
    const [scrapeId, setScrapeId] = useState(null);
    const [filters, setFilters] = useState({ online: '', faction: '', race: '', characterClass: '', guild: '' });

    const { timestamps } = useProgressionTimestamps();

    const { progression, error } = useProgression(
        scrapeId,
        filters.online,
        filters.faction,
        filters.race,
        filters.characterClass,
        filters.guild
    );

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

            <ProgressionTimeline timestamps={timestamps} onChange={setScrapeId} />
            
            <ProgressionFilters onChange={setFilters} />

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