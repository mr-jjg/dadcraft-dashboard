import { useState, useEffect, useCallback } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMetricRange } from '../hooks/useMetricRange';
import { mergeByTime } from '../utils/chart';

function MetricLine({ lineConfig, onData }) {
    const { data, error } = useMetricRange(lineConfig.endpoint);

    useEffect(() => {
        onData(lineConfig.key, data, error);
    }, [data, error]);

    return null;
}

export function ChartPanel({ label, lines }) {
    const [results, setResults] = useState({});

    const handleData = useCallback((key, data, error) => {
        setResults(prev => ({ ...prev, [key]: { data, error } }));
    }, []);

    const values = Object.values(results);
    const error = values.find(r => r.error)?.error;
    const loading = values.length < lines.length || values.some(r => !r.data);

    const data = loading || error ? [] : mergeByTime(
        lines.map(({ key }) => ({ key, data: results[key]?.data || [] }))
    );

    return (
        <>
            {lines.map(l => (
                <MetricLine key={l.key} lineConfig={l} onData={handleData} />
            ))}
            <p>{label}</p>
            {error && <p>Error: {error.message}</p>}
            {loading && <p>Loading...</p>}
            {!loading && !error && (
                <LineChart width={600} height={300} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()} />
                    <Legend />
                    {lines.map(({ key, color }) => (
                        <Line key={key} dataKey={key} stroke={color} dot={false} />
                    ))}
                </LineChart>
            )}
        </>
    )
}
