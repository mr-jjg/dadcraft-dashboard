import { useState } from 'react';
import { ChartPanel } from './ChartPanel';
import { MetricTile } from './MetricTile';
import { METRICS } from '../constants/metrics'

const EMPTY_LINES = [] // Stable reference - prevents React.memo on ChartPanel from re-rendering when no metric is selected

export function MetricsPanel() {
    const [selectedMetric, setSelectedMetric] = useState(null);

    const handleTileClick = (metric) => {
        setSelectedMetric(prev => prev?.label === metric.label ? null : metric);
    }

    return (
        <div style={{ width: '600px' }}>
            <h2>Metrics</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {METRICS.map(metric => (
                    <MetricTile
                        key={metric.label}
                        metric={metric}
                        active={selectedMetric?.label === metric.label}
                        onClick={() => handleTileClick(metric)}
                    />
                ))}
            </div>
            <div style={{ height: '700px' }}>
                <ChartPanel
                    key="metrics-chart"
                    label={selectedMetric?.label ?? 'Select a metric to view history'}
                    lines={selectedMetric?.lines ?? EMPTY_LINES}
                />
            </div>
        </div>
    );
}
