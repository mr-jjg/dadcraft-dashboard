import { useState, useEffect } from 'react';
import { availableSteps } from '../utils/metricRange';

export function MetricsTimeline({ windowSeconds, onChange }) {
    const steps = availableSteps(windowSeconds);
    const [selected, setSelected] = useState(steps[0] ?? null);

    useEffect(() => {
        if (steps.length === 0) return;
        if (steps.includes(selected)) return;
        const closest = steps.reduce((best, s) =>
            Math.abs(s - selected) < Math.abs(best - selected) ? s : best
        )
        setSelected(closest);
        onChange(closest);
    }, [windowSeconds]);

    const handleChange = (e) => {
        const step = Number(e.target.value);
        setSelected(step);
        onChange(step);
    };

    if (steps.length === 0) return null;

    return (
        <div>
            <label>
                Granularity
                <select value={selected ?? ''} onChange={handleChange}>
                    {steps.map(s => (
                        <option key={s} value={s}>{s}s</option>
                    ))}
                </select>
            </label>
        </div>
    );
}
