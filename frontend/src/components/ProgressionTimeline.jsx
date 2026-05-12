import { useState, useEffect } from 'react';
import { PeriodNavigator } from './PeriodNavigator';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { bucketTimestamps, BUCKET_CONFIG } from '../utils/progression';
import { formatTimestamp } from '../utils/format';

const RANGES = Object.keys(BUCKET_CONFIG);

export function ProgressionTimeline({ timestamps, onChange }) {
    const [range, setRange] = useState('1D');
    const [periodEnd, setPeriodEnd] = useState(null);
    const [sliderPosition, setSliderPosition] = useState(0);

    const snapshots = bucketTimestamps(timestamps, range, periodEnd);

    useEffect(() => {
        setSliderPosition(snapshots.length - 1);
    }, [range, periodEnd, snapshots.length]);

    const settledIndex = useDebouncedValue(sliderPosition);
    const displaySnapshot = snapshots[sliderPosition] ?? snapshots[snapshots.length - 1] ?? null;
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
                <PeriodNavigator
                    range={range}
                    timestamps={timestamps}
                    onChange={setPeriodEnd}
                />
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
                        {activeSnapshot ? formatTimestamp(displaySnapshot.scraped_at) : ''}
                    </span>
                </div>
            )}
        </div>
    )
}
