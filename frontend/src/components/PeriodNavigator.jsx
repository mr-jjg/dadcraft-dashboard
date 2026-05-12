import { useState, useEffect } from 'react';
import { snapToPeriodStart, stepPeriod, periodEnd, periodLabel } from '../utils/period';

export function PeriodNavigator({ range, timestamps, onChange }) {
    const [periodStart, setPeriodStart] = useState(() => snapToPeriodStart(new Date(), range));

    // re-snap when range changes - find the period that contains the current periodStart
    useEffect(() => {
        if (!timestamps || timestamps.length === 0) return;
        const firstTimestamp = new Date(timestamps[0].scraped_at * 1000);
        const firstPeriod = snapToPeriodStart(firstTimestamp, range);
        setPeriodStart(prev => {
            const snapped = snapToPeriodStart(prev, range);
            return snapped < firstPeriod ? firstPeriod : snapped;
        });
    }, [range, timestamps]);

    // emit periodEnd whenever periodStart or range changes
    useEffect(() => {
        onChange(periodEnd(periodStart, range));
    }, [periodStart, range]);

    const empty = !timestamps || timestamps.length === 0;

    const isPrevDisabled = empty || (() => {
        const prevStart = stepPeriod(periodStart, range, -1);
        return periodEnd(prevStart, range) <= timestamps[0].scraped_at;
    })();

    const isNextDisabled = empty || (() => {
        const todayStart = snapToPeriodStart(new Date(), range);
        return periodStart >= todayStart;
    })();

    const handlePrev = () => setPeriodStart(prev => stepPeriod(prev, range, -1));
    const handleNext = () => setPeriodStart(prev => stepPeriod(prev, range, 1));

    return (
        <div>
            <button onClick={handlePrev} disabled={isPrevDisabled}>Prev</button>
            <span>{empty ? '' : periodLabel(periodStart, range)}</span>
            <button onClick={handleNext} disabled={isNextDisabled}>Next</button>
        </div>
    );
}
