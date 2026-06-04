import { useEffect } from 'react';
import { snapToPeriodStart, stepPeriod, periodEnd, periodLabel } from '../utils/period';

export function PeriodNavigator({ range, timestamps, periodStart, onResnap, onNavigate }) {
    useEffect(() => {
        if (!timestamps || timestamps.length === 0) return;
        const firstTimestamp = new Date(timestamps[0].scraped_at * 1000);
        const firstPeriod = snapToPeriodStart(firstTimestamp, range);
        const base = periodStart ?? new Date();
        const snapped = snapToPeriodStart(base, range);
        onResnap(snapped < firstPeriod ? firstPeriod : snapped);
    }, [range, timestamps]);

    const empty = !timestamps || timestamps.length === 0;

    const isPrevDisabled = empty || periodStart == null || (() => {
        const prevStart = stepPeriod(periodStart, range, -1);
        return periodEnd(prevStart, range) <= timestamps[0].scraped_at;
    })();

    const isNextDisabled = empty || periodStart == null || (() => {
        const todayStart = snapToPeriodStart(new Date(), range);
        return periodStart >= todayStart;
    })();

    return (
        <div className="period-navigator">
            <button className='btn-secondary' onClick={() => onNavigate(stepPeriod(periodStart, range, -1))} disabled={isPrevDisabled}>Prev</button>
            <span>{empty || periodStart == null ? '' : periodLabel(periodStart, range)}</span>
            <button className='btn-secondary' onClick={() => onNavigate(stepPeriod(periodStart, range, 1))} disabled={isNextDisabled}>Next</button>
        </div>
    );
}
