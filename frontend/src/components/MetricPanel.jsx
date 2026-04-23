import { useMetric } from "../hooks/useMetrics";

export function MetricPanel({ label, endpoint, unit }) {
    const { value, error } = useMetric(endpoint);
    if (error) return <p>Error: {error.message}</p>;
    if (value == null) return <p>Loading...</p>;
    return <p>{label}: {value.toFixed(1)}{unit}</p>;
}
