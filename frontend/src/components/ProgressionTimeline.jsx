import { useState, useEffect } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { bucketTimestamps, BUCKET_CONFIG } from '../utils/progression';
import { formatSliderTime, todayString } from '../utils/format';

const RANGES = Object.keys(BUCKET_CONFIG);

export function ProgressionTimeline({ timestamps, onChange }) {
    const [range, setRange] = useState('1D');
    const [sliderPosition, setSliderPosition] = useState(0);
    const [selectedDate, setSelectedDate] = useState(todayString());

    const windowEnd = (() => {
        const [year, month, day] = selectedDate.split('-').map(Number)
        return new Date(year, month - 1, day + 1).getTime() / 1000
    })()
    const snapshots = bucketTimestamps(timestamps, range, windowEnd);

    useEffect(() => {
        setSliderPosition(snapshots.length - 1);
    }, [range, selectedDate, snapshots.length]);

    const settledIndex = useDebouncedValue(sliderPosition);
    const activeSnapshot = snapshots[settledIndex] ?? snapshots[snapshots.length - 1] ?? null;

    useEffect(() => {
        onChange(activeSnapshot?.id ?? null);
    }, [activeSnapshot?.id]);

    return (
        <div>
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

            {snapshots.length > 1 && (
                <div>
                    <input
                        type="range"
                        min={0}
                        max={snapshots.length - 1}
                        value={sliderPosition}
                        onChange={e => setSliderPosition(Number(e.target.value))}
                    />
                    <span>
                        {activeSnapshot ? formatSliderTime(activeSnapshot.scraped_at, range) : ''}
                    </span>
                </div>
            )}
        </div>
    )
}
