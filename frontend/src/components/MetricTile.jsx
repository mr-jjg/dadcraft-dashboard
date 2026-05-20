import { useMetric } from '../hooks/useMetrics';
import { formatTime } from '../utils/format';

export function MetricTile({ metric, active, onClick }) {
    const { value, error } = useMetric(metric.endpoint);
    const clickable = !!metric.lines;

    const formatted = () => {
        if (error) return 'Error';
        if (value == null) return '...';
        if (metric.unit === 'uptime') return formatTime(value);
        return `${value.toFixed(metric.precision ?? 0)}${metric.unit ?? ''}`;
    }

    return (
        <div
            onClick={clickable ? onClick : undefined}
            style={{
                cursor: clickable ? 'pointer' : 'default',
                opacity: error ? 0.5 : 1,
            }}
        >
            <div>{metric.label}</div>
            <div>{formatted()}</div>
        </div>
    );
}
