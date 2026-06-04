import React, { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside'
import { ChartPanel } from './ChartPanel';
import { CollapseHandle } from './CollapseHandle'
import { MetricTile } from './MetricTile';
import { GROUPS, METRICS } from '../constants/metrics'

const EMPTY_LINES = []

const GROUPS_MAP = METRICS.reduce((acc, metric) => {
    if (!acc[metric.group]) acc[metric.group] = []
    acc[metric.group].push(metric)
    return acc
}, {})

function groupByLines(metrics) {
    const result = []
    for (const metric of metrics) {
        const last = result[result.length - 1]
        if (last && last.lines === metric.lines) {
            last.items.push(metric)
        } else {
            result.push({ lines: metric.lines, items: [metric] })
        }
    }
    return result
}

export function MetricsPanel() {
    const [selectedLines, setSelectedLines] = useState(null)
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [hasSelected, setHasSelected] = useState(false)
    const [tilesOpen, setTilesOpen] = useState(true)
    const [hoveredLines, setHoveredLines] = useState(null)
    const controlsRef = useRef(null)
    useClickOutside(controlsRef, () => setTilesOpen(false))

    const handleTileClick = (metric) => {
        setHasSelected(true)
        setSelectedLines(metric.lines)
        setSelectedUnit(metric.unit)
    }

    return (
        <div className="panel-root">
            <h2>Metrics</h2>
            <div className="panel-layout" style={{ flex: 1, minHeight: 0 }}>
                <div className="panel-main">
                    <div style={{ position: 'absolute', zIndex: 1, width: '100%', textAlign: 'center' }}>
                        {!hasSelected && <p>Click a metric to get started.</p>}
                    </div>
                    <ChartPanel
                        key="metrics-chart"
                        lines={selectedLines ?? EMPTY_LINES}
                        unit={selectedUnit}
                    />
                </div>
                <div className="panel-controls-overlay" ref={controlsRef}>
                    <div className="panel-controls">
                        {tilesOpen && (
                            <div className="panel-controls-content">
                                {Object.entries(GROUPS_MAP).map(([group, metrics], i, arr) => (
                                    <React.Fragment key={group}>
                                        <fieldset>
                                            <legend>{GROUPS[group]}</legend>
                                            {groupByLines(metrics).map(({ lines, items }) => (
                                                <div
                                                    key={items[0].label}
                                                    className={`metric-tile-group${lines === selectedLines ? ' active' : ''}${lines === hoveredLines ? ' hovered' : ''}`}
                                                >
                                                    {items.map(metric => (
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
                                        </fieldset>
                                        {i < arr.length - 1 && <hr className="section-divider" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    <CollapseHandle
                        orientation="vertical"
                        isOpen={tilesOpen}
                        onToggle={() => setTilesOpen(o => !o)}
                    />
                </div>
            </div>
        </div>
    )
}