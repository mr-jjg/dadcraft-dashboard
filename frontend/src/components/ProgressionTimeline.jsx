import { useState } from 'react';
import { PeriodNavigator } from './PeriodNavigator';
import { SnapshotSlider } from './SnapshotSlider';
import { bucketTimestamps, BUCKET_CONFIG } from '../utils/progression';

const RANGES = Object.keys(BUCKET_CONFIG);

export function ProgressionTimeline({ timestamps, onChange }) {
    const [range, setRange] = useState('1D');
    const [periodEnd, setPeriodEnd] = useState(null);

    const snapshots = bucketTimestamps(timestamps, range, periodEnd);

    return (
        <div style={{ display: 'flex' }}>
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

            <PeriodNavigator
                range={range}
                timestamps={timestamps}
                onChange={setPeriodEnd}
            />

            <SnapshotSlider snapshots={snapshots} onChange={onChange} />
        </div>
    )
}
