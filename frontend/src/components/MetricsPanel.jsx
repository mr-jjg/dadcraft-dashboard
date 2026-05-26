import { useState } from 'react';
import { ChartPanel } from './ChartPanel';
import { CollapseHandle } from './CollapseHandle'
import { MetricTile } from './MetricTile';
import { GROUPS, METRICS } from '../constants/metrics'

const EMPTY_LINES = [] // Stable reference - prevents React.memo on ChartPanel from re-rendering when no metric is selected

const GROUPS_MAP = METRICS.reduce((acc, metric) => {
    if (!acc[metric.group]) acc[metric.group] = []
    acc[metric.group].push(metric)
    return acc
}, {})

export function MetricsPanel() {
    const [selectedLines, setSelectedLines] = useState(null)
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [hasSelected, setHasSelected] = useState(false)
    const [tilesOpen, setTilesOpen] = useState(true)
    const [hoveredLines, setHoveredLines] = useState(null)

    const handleTileClick = (metric) => {
        setHasSelected(true)
        setSelectedLines(metric.lines)
        setSelectedUnit(metric.unit)
    }

    return (
        <div>
            <h2>Metrics</h2>

            <div style={{ display: 'flex' }}>
                {tilesOpen && (
                    <div>
                        {Object.entries(GROUPS_MAP).map(([group, metrics]) => (
                            <div key={group} style={{ marginBottom: '8px' }}>
                                <div className="section-label">{GROUPS[group]}</div>
                                {metrics.map(metric => (
                                    <MetricTile
                                        key={metric.label}
                                        metric={metric}
                                        active={selectedLines === metric.lines}
                                        hovered={hoveredLines === metric.lines}
                                        onClick={() => handleTileClick(metric)}
                                        onMouseEnter={() => setHoveredLines(metric.lines)}
                                        onMouseLeave={() => setHoveredLines(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                <CollapseHandle
                    orientation="vertical"
                    isOpen={tilesOpen}
                    onToggle={() => setTilesOpen(o => !o)}
                />

                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', zIndex: 1, width: '100%', textAlign: 'center' }}>
                        {!hasSelected && <p>Click a metric to get started.</p>}
                    </div>
                    <ChartPanel
                        key="metrics-chart"
                        lines={selectedLines ?? EMPTY_LINES}
                        unit={selectedUnit}
                    />
                </div>
            </div>
        </div>
    );
}
