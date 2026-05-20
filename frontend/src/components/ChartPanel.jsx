import React, { useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush } from 'recharts';
import { useChartData } from '../hooks/useChartData';
import { MetricsTimeline } from './MetricsTimeline';
import { formatAxisTime } from '../utils/format';

export const ChartPanel = React.memo(function ChartPanel({ label, lines }) {
    const [stepOverride, setStepOverride] = useState(null);
    const { overviewData, detailData, overviewError, detailError, windowSeconds, onBrushChange, brushStart, brushEnd } = useChartData(lines, undefined, stepOverride);

    return (
        <>
            <p>{label}</p>

            {windowSeconds && (
                <MetricsTimeline windowSeconds={windowSeconds} onChange={setStepOverride} />
            )}

            {(overviewError || detailError) && (
                <p>Error: {(overviewError || detailError).message}</p>
            )}

            {!overviewError && !detailError && (
                <>
                    <LineChart width={600} height={150} data={overviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={formatAxisTime} />
                        <YAxis />
                        <Tooltip labelFormatter={formatAxisTime} />
                        {lines.map(({ key, color }) => (
                            <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                        ))}
                        <Brush
                            dataKey="time"
                            height={30}
                            tickFormatter={formatAxisTime}
                            onChange={onBrushChange}
                            {...(brushStart !== undefined ? { startIndex: brushStart, endIndex: brushEnd } : {})}
                        />
                    </LineChart>

                    <LineChart width={600} height={300} data={detailData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={formatAxisTime} />
                        <YAxis />
                        <Tooltip labelFormatter={formatAxisTime} />
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
