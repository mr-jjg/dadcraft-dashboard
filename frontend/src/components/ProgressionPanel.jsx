import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ProgressionFilters } from './ProgressionFilters';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useProgression } from '../hooks/useProgression';
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps';
import { bucketTimestamps, BUCKET_CONFIG } from '../utils/progression';
import { formatSliderTime } from '../utils/format';
import { ALL_CLASSES, CLASS_COLORS } from '../utils/wow';

const RANGES = Object.keys(BUCKET_CONFIG);

function todayString() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function ProgressionPanel() {
    const [filters, setFilters] = useState({ online: '', faction: '', race: '', characterClass: '', guild: '' });
    const [range, setRange] = useState('1D');
    const [sliderIndex, setSliderIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(todayString());

    const { timestamps } = useProgressionTimestamps();
    const anchor = (() => {
        const [year, month, day] = selectedDate.split('-').map(Number)
        return new Date(year, month - 1, day + 1).getTime() / 1000
    })()

    const bucketed = bucketTimestamps(timestamps, range, anchor);

    useEffect(() => {
        setSliderIndex(bucketed.length - 1);
    }, [range, selectedDate, bucketed.length]);

    const debouncedSliderIndex = useDebouncedValue(sliderIndex);
    const selectedEntry = bucketed[debouncedSliderIndex] ?? bucketed[bucketed.length - 1] ?? null;
    const scrapeId = selectedEntry?.id ?? null;

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

            <div>
                {RANGES.map(r => {
                    const count = bucketTimestamps(timestamps, r).length;
                    if (r !== '1D' && count <= 1) return null;
                    return (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            disabled={r === range}
                        >
                            {r}
                        </button>
                    );
                })}
            </div>

            {range !== 'All' && (
                <label>
                    Date
                    <input
                        type="date"
                        value={selectedDate}
                        max={todayString()}
                        onChange={e => setSelectedDate(e.target.value)}
                    />
                </label>
            )}

            {bucketed.length > 1 && (
                <div>
                    <input
                        type="range"
                        min={0}
                        max={bucketed.length - 1}
                        value={sliderIndex}
                        onChange={e => setSliderIndex(Number(e.target.value))}
                    />
                    <span>
                        {selectedEntry ? formatSliderTime(selectedEntry.scraped_at, range) : ''}
                    </span>
                </div>
            )}
            
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