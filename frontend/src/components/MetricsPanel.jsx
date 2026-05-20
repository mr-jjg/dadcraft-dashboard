import { useState } from 'react';
import { ChartPanel } from './ChartPanel';
import { MetricTile } from './MetricTile';
import { METRICS } from '../constants/metrics'

const EMPTY_LINES = [] // Stable reference - prevents React.memo on ChartPanel from re-rendering when no metric is selected

export function MetricsPanel() {
    const [selectedMetric, setSelectedMetric] = useState(null);

    const handleTileClick = (metric) => {
        setSelectedMetric(metric);
    }

    return (
        <div>
            <h2>Metrics</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {METRICS.map(metric => (
                        <MetricTile
                            key={metric.label}
                            metric={metric}
                            active={selectedMetric?.label === metric.label}
                            onClick={() => handleTileClick(metric)}
                        />
                    ))}
                </div>
                <div style={{ height: '550px' }}>
                    <ChartPanel
                        key="metrics-chart"
                        lines={selectedMetric?.lines ?? EMPTY_LINES}
                        unit={selectedMetric?.unit}
                    />
                </div>
            </div>
        </div>
    );
}
