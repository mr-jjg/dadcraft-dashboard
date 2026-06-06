import { useMetric } from '../hooks/useMetrics';

export function MetricTile({ metric, active, hovered, onClick, onMouseEnter, onMouseLeave }) {
    const { value, error } = useMetric(metric.endpoint);
    const clickable = !!metric.lines;

    const formatted = () => {
        if (error) return 'Error';
        if (value == null) return '...';
        return `${value.toFixed(metric.precision ?? 0)}${metric.unit ?? ''}`;
    }

    return (
        <div
            onClick={clickable ? onClick : undefined}
            onMouseEnter={clickable ? onMouseEnter : undefined}
            onMouseLeave={clickable ? onMouseLeave : undefined}
            className={`metric-tile${active ? ' active' : ''}${hovered && !active ? ' hovered' : ''}`}
            style={{
                cursor: clickable ? 'pointer' : 'default',
                opacity: error ? 0.5 : 1,
            }}
        >
            <span style={{ minWidth: '90px' }}>{metric.label}</span>
            <span style={{ minWidth: '90px', textAlign: 'right' }}>{formatted()}</span>
        </div>
    );
}
