import { useMetricRange } from "../hooks/useMetricRange";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function ChartPanel({ label, endpoint, unit }) {
    const { data, error } = useMetricRange(endpoint);
    if (error) return <p>Error: {error.message}</p>;
    if (data == null) return <p>Loading...</p>;

    return (
        <>
            <p>{label}</p>
            <LineChart width={600} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()} />
                <YAxis unit={unit} />
                <Tooltip labelFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()} />
                <Line dataKey="value" dot={false} />
            </LineChart>
        </>
    )
}
