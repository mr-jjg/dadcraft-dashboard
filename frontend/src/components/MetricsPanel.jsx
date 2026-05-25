import { useState } from 'react';
import { ChartPanel } from './ChartPanel';
import { MetricTile } from './MetricTile';
import { METRICS } from '../constants/metrics'

const EMPTY_LINES = [] // Stable reference - prevents React.memo on ChartPanel from re-rendering when no metric is selected

export function MetricsPanel() {
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [hasSelected, setHasSelected] = useState(false)

    const handleTileClick = (metric) => {
        setHasSelected(true)
        setSelectedMetric(metric);
    }

    return (
        <div>
            <h2>Metrics</h2>
            <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {METRICS.map(metric => (
                        <MetricTile
                            key={metric.label}
                            metric={metric}
                            active={selectedMetric?.lines === metric.lines}
                            onClick={() => handleTileClick(metric)}
                        />
                    ))}
                </div>
                <div style={{ height: '550px', position: 'relative' }}>
                    <div style={{ position: 'absolute', zIndex: 1, width: '100%', textAlign: 'center' }}>
                        {!hasSelected && <p>Click a metric to get started.</p>}
                    </div>
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
