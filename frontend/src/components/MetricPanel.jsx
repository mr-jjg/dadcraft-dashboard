import { useMetric } from "../hooks/useMetrics";

function formatUptime(s) {
    const days    = Math.floor(s / 86400);
    const hours   = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);

    const d = String(days).padStart(2, "0");
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");

    return `${d}:${h}:${m}`;
}

export function MetricPanel({ label, endpoint, unit, precision=0 }) {
    const { value, error } = useMetric(endpoint);
    if (error) return <p>Error: {error.message}</p>;
    if (value == null) return <p>Loading...</p>;
    if (unit === 'uptime') return <p>{label}: {formatUptime(value)}</p>
    return <p>{label}: {value.toFixed(precision)}{unit}</p>;
}
