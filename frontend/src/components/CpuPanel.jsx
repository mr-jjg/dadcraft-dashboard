import { useCpu } from "../hooks/useMetrics";

export function CpuPanel() {
    const { value, error } = useCpu();
    if (error) return <p>Error: {error.message}</p>;
    if (value == null) return <p>Loading...</p>;
    return <p>CPU: {value}%</p>;
}
