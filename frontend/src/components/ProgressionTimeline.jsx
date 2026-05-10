import { useState, useEffect } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { bucketTimestamps, BUCKET_CONFIG } from '../utils/progression';
import { formatSliderTime, todayString } from '../utils/format';

const RANGES = Object.keys(BUCKET_CONFIG);

export function ProgressionTimeline({ timestamps, onChange }) {
    const [range, setRange] = useState('1D');
    const [sliderIndex, setSliderIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(todayString());

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

    useEffect(() => {
        onChange(selectedEntry?.id ?? null);
    }, [selectedEntry?.id]);

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
        </div>
    )
}
