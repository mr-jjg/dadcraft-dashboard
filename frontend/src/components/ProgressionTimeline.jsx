import { PeriodNavigator } from './PeriodNavigator';
import { SnapshotSlider } from './SnapshotSlider';
import { bucketTimestamps, BUCKET_CONFIG } from '../utils/progression';
import { periodEnd as computePeriodEnd } from '../utils/period';

const RANGES = Object.keys(BUCKET_CONFIG);

export function ProgressionTimeline({ timeline, onTimelineChange, timestamps, onChange }) {
    const { range, periodStart, sliderPosition: storedPosition } = timeline;

    const windowEnd = periodStart != null ? computePeriodEnd(periodStart, range) : null;
    const snapshots = bucketTimestamps(timestamps, range, windowEnd);

    const lastIndex = Math.max(0, snapshots.length - 1);
    const sliderPosition = storedPosition == null ? lastIndex : Math.min(storedPosition, lastIndex);

    return (
        <div className="progression-timeline">
            <div className="range-buttons">
                {RANGES.map(r => {
                    const count = bucketTimestamps(timestamps, r).length;
                    if (r !== '1D' && count <= 1) return null;
                    return (
                        <button
                            key={r}
                            onClick={() => onTimelineChange({ range: r, sliderPosition: null })}
                            className={`btn-secondary${r === range ? ' active' : ''}`}
                        >
                            {r}
                        </button>
                    );
                })}
            </div>

            <PeriodNavigator
                range={range}
                timestamps={timestamps}
                periodStart={periodStart}
                onResnap={(newStart) => onTimelineChange({ periodStart: newStart })}
                onNavigate={(newStart) => onTimelineChange({ periodStart: newStart, sliderPosition: null })}
            />

            <SnapshotSlider
                snapshots={snapshots}
                sliderPosition={sliderPosition}
                onSliderChange={(pos) => onTimelineChange({ sliderPosition: pos })}
                onChange={onChange}
            />
        </div>
    )
}
