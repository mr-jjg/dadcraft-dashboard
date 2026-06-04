import { useEffect } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatTimestamp } from '../utils/format';

export function SnapshotSlider({ snapshots, sliderPosition, onSliderChange, onChange }) {
    const settledIndex = useDebouncedValue(sliderPosition);
    const displaySnapshot = snapshots[sliderPosition] ?? snapshots[snapshots.length - 1] ?? null;
    const activeSnapshot = snapshots[settledIndex] ?? snapshots[snapshots.length - 1] ?? null;

    useEffect(() => {
        onChange(activeSnapshot?.id ?? null);
    }, [activeSnapshot?.id]);

    if (snapshots.length <= 1) return null;

    return (
        <div className="snapshot-slider">
            <input
                type="range"
                min={0}
                max={snapshots.length - 1}
                value={sliderPosition}
                onChange={e => onSliderChange(Number(e.target.value))}
            />
            <span>
                {displaySnapshot ? formatTimestamp(displaySnapshot.scraped_at) : ''}
            </span>
        </div>
    );
}
