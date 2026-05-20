import React, { useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush } from 'recharts';
import { useChartData } from '../hooks/useChartData';
import { MetricsTimeline } from './MetricsTimeline';
import { formatAxisTime } from '../utils/format';

export const ChartPanel = React.memo(function ChartPanel({ label, lines, unit }) {
    const [stepOverride, setStepOverride] = useState(null);
    const { overviewData, detailData, overviewError, detailError, windowSeconds, onBrushChange, brushStart, brushEnd, brushKey } = useChartData(lines, undefined, stepOverride);

    return (
        <>
            <p>{label}</p>

            {windowSeconds && (
                <MetricsTimeline windowSeconds={windowSeconds} onChange={setStepOverride} ready={lines.length > 0} />
            )}

            {(overviewError || detailError) && (
                <p>Error: {(overviewError || detailError).message}</p>
            )}

            {!overviewError && !detailError && (
                <>
                    <LineChart width={600} height={300} data={detailData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={(formatAxisTime)} />
                        <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
                        <Tooltip labelFormatter={formatAxisTime} formatter={(value) => value.toFixed(1)} />
                        <Legend verticalAlign='top' />
                        {lines.map(({ key, color }) => (
                            <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                        ))}
                    </LineChart>

                    <LineChart width={600} height={180} data={overviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={formatAxisTime} hide />
                        <YAxis />
                        <Tooltip labelFormatter={formatAxisTime} formatter={(value) => value.toFixed(1)} />
                        {lines.map(({ key, color }) => (
                            <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                        ))}
                    </LineChart>

                    <LineChart width={600} height={20} data={overviewData} margin={{ left: 60 }}>
                        <Brush
                            key={brushKey}
                            dataKey="time"
                            height={20}
                            tickFormatter={formatAxisTime}
                            onChange={onBrushChange}
                            {...(brushStart !== undefined ? { startIndex: brushStart, endIndex: brushEnd } : {})}
                        />
                    </LineChart>
                </>
            )}
        </>
    );
})
