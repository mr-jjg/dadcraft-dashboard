import React, { useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ResponsiveContainer } from 'recharts';
import { useChartData } from '../hooks/useChartData';
import { MetricsTimeline } from './MetricsTimeline';
import { formatAxisTime } from '../utils/format';

export const ChartPanel = React.memo(function ChartPanel({ lines, unit }) {
    const [stepOverride, setStepOverride] = useState(null);
    const { overviewData, detailData, overviewError, detailError, windowSeconds, onBrushChange, brushStart, brushEnd, brushKey } = useChartData(lines, undefined, stepOverride);

    return (
        <>
            <div style={{ position: 'relative' }}>

                <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
                    {windowSeconds && (
                        <MetricsTimeline windowSeconds={windowSeconds} onChange={setStepOverride} ready={lines.length > 0} />
                    )}
                </div>

                {(overviewError || detailError) && (
                    <p>Error: {(overviewError || detailError).message}</p>
                )}

                {!overviewError && !detailError && (
                    <>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={detailData} margin={{ top: 5, right: 90, bottom: 5, left: 0 }}>
                                <XAxis dataKey="time" tickFormatter={formatAxisTime} minTickGap={77} />
                                <YAxis width={90} label={{ value: unit, angle: -90, position: 'insideLeft' }} />
                                <Tooltip labelFormatter={formatAxisTime} formatter={(value) => value.toFixed(1)} itemSorter={null} />
                                <Legend verticalAlign='top' itemSorter={null} />
                                {lines.map(({ key, color }) => (
                                    <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={overviewData} margin={{ top: 5, right: 90, bottom: 5, left: 0 }}>
                                <XAxis dataKey="time" tick={false} tickLine={false} />
                                <YAxis width={90} tick={false} tickLine={false} />
                                <Tooltip labelFormatter={formatAxisTime} formatter={(value) => value.toFixed(1)} itemSorter={null} />
                                {lines.map(({ key, color }) => (
                                    <Line key={key} dataKey={key} stroke={color} dot={false} isAnimationActive={false} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height={30}>
                            <LineChart data={overviewData} margin={{ top: 0, right: 90, bottom: 0, left: 90 }}>
                                <Brush
                                    key={brushKey}
                                    dataKey="time"
                                    height={30}
                                    tickFormatter={formatAxisTime}
                                    alwaysShowText
                                    travellerWidth={10}
                                    onChange={onBrushChange}
                                    {...(brushStart !== undefined ? { startIndex: brushStart, endIndex: brushEnd } : {})}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </>
    );
})
