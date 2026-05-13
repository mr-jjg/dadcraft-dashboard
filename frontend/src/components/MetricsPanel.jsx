import { useState } from 'react';
import { ChartPanel } from './ChartPanel';
import { MetricTile } from './MetricTile';

const NETWORK_LINES = [
    { key: 'Network In', endpoint: '/api/system/rx/range', color: '#8884d8' },
    { key: 'Network Out', endpoint: '/api/system/tx/range', color: '#ff7300' },
]

const MEMORY_AND_SWAP = [
    { key: 'Memory', endpoint: '/api/system/memory/range', color: '#8884d8' },
    { key: 'Swap', endpoint: '/api/system/swap/range', color: '#82ca9d' },
]

const LOAD_LINES = [
    { key: 'load1',  endpoint: '/api/system/load1/range',  color: '#8884d8' },
    { key: 'load5',  endpoint: '/api/system/load5/range',  color: '#82ca9d' },
    { key: 'load15', endpoint: '/api/system/load15/range', color: '#ff7300' },
]

const METRICS = [
    { label: 'System Uptime', endpoint: '/api/system/uptime',  unit: 'uptime' },
    { label: 'CPU',           endpoint: '/api/system/cpu',     unit: '%', precision: 1,
      lines: [{ key: 'CPU', endpoint: '/api/system/cpu/range', color: '#8884d8' }] },
    { label: 'Memory',        endpoint: '/api/system/memory',  unit: '%', precision: 1, lines: MEMORY_AND_SWAP },
    { label: 'Swap',          endpoint: '/api/system/swap',    unit: '%', precision: 1, lines: MEMORY_AND_SWAP },
    { label: 'Disk',          endpoint: '/api/system/disk',    unit: '%', precision: 1,
      lines: [{ key: 'Disk', endpoint: '/api/system/disk/range', color: '#ff7300' }] },
    { label: 'I/O Wait',      endpoint: '/api/system/io',      unit: '%', precision: 1,
      lines: [{ key: 'I/O Wait', endpoint: '/api/system/io/range', color: '#ff7300' }] },
    { label: 'Network In',    endpoint: '/api/system/rx',      unit: ' B/s', lines: NETWORK_LINES },
    { label: 'Network Out',   endpoint: '/api/system/tx',      unit: ' B/s', lines: NETWORK_LINES },
    { label: 'Load (1m)',     endpoint: '/api/system/load1',   unit: '', precision: 1, lines: LOAD_LINES },
    { label: 'Load (5m)',     endpoint: '/api/system/load5',   unit: '', precision: 1, lines: LOAD_LINES },
    { label: 'Load (15m)',    endpoint: '/api/system/load15',  unit: '', precision: 1, lines: LOAD_LINES },
]

export function MetricsPanel() {
    const [selected, setSelected] = useState(null);

    const handleTileClick = (metric) => {
        setSelected(prev => prev?.label === metric.label ? null : metric);
    }

    return (
        <div style={{ width: '600px' }}>
            <h2>Metrics</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {METRICS.map(metric => (
                    <MetricTile
                        key={metric.label}
                        metric={metric}
                        active={selected?.label === metric.label}
                        onClick={() => handleTileClick(metric)}
                    />
                ))}
            </div>
            <div style={{ height: '350px' }}>
                <ChartPanel
                    key="metrics-chart"
                    label={selected?.label ?? 'Select a metric to view history'}
                    lines={selected?.lines ?? []}
                />
            </div>
        </div>
    );
}
