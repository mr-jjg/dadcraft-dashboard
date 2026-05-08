import { formatTime } from "../utils/format";
import { useMetric } from "../hooks/useMetrics";

export function MetricPanel({ label, endpoint, unit, precision=0 }) {
    const { value, error } = useMetric(endpoint);
    if (error) return <p>Error: {error.message}</p>;
    if (value == null) return <p>Loading...</p>;
    if (unit === 'uptime') return <p>{label}: {formatTime(value)}</p>
    return <p>{label}: {value.toFixed(precision)}{unit}</p>;
}
