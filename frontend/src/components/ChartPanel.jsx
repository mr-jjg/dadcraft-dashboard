import React, { useEffect } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush } from 'recharts';
import { useChartData } from '../hooks/useChartData';

const timeFormatter = (ts) => new Date(ts * 1000).toLocaleTimeString();

export const ChartPanel = React.memo(function ChartPanel({ label, lines, onWindowChange, stepOverride }) {
    const { overviewData, detailData, overviewError, detailError, windowSeconds, onBrushChange } = useChartData(lines, undefined, stepOverride);

    useEffect(() => {
        if (onWindowChange) onWindowChange(windowSeconds);
    }, [windowSeconds]);

    return (
        <>
            <p>{label}</p>

            {(overviewError || detailError) && (
                <p>Error: {(overviewError || detailError).message}</p>
            )}

            {!overviewError && !detailError && (
                <>
                    <LineChart width={600} height={150} data={overviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={timeFormatter} />
                        <YAxis />
                        <Tooltip labelFormatter={timeFormatter} />
                        {lines.map(({ key, color }) => (
                            <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                        ))}
                        <Brush dataKey="time" height={30} tickFormatter={timeFormatter} onChange={onBrushChange} />
                    </LineChart>

                    <LineChart width={600} height={300} data={detailData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={timeFormatter} />
                        <YAxis />
                        <Tooltip labelFormatter={timeFormatter} />
                        <Legend />
                        {lines.map(({ key, color }) => (
                            <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                        ))}
                    </LineChart>
                </>
            )}
        </>
    );
})
