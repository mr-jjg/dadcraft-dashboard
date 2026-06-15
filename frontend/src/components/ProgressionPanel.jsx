import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CollapseHandle } from './CollapseHandle'
import { ProgressionFilters } from './ProgressionFilters';
import { ProgressionTimeline } from './ProgressionTimeline';
import { useProgression } from '../hooks/useProgression';
import { useProgressionTimestamps } from '../hooks/useProgressionTimestamps';
import { ALL_CLASSES, CLASS_COLORS } from '../constants/wow';

export function ProgressionPanel() {
    const [scrapeId, setScrapeId] = useState(null);
    const [filters, setFilters] = useState({ online: '', faction: '', race: '', characterClass: '', guild: '' });
    const [controlsOpen, setControlsOpen] = useState(true)
    const [timeline, setTimeline] = useState({ range: '1D', periodStart: null, sliderPosition: null })

    const controlsRef = useRef(null)
    useClickOutside(controlsRef, () => setControlsOpen(false))
    const updateTimeline = (updates) => setTimeline(prev => ({ ...prev, ...updates }))

    const { timestamps } = useProgressionTimestamps();

    const { progression, error } = useProgression(
        scrapeId,
        filters.online,
        filters.faction,
        filters.race,
        filters.characterClass,
        filters.guild
    );

    const chartData = {};
    (progression || []).forEach(({ Labels, Value }) => {
        const lvl = Labels.level;
        if (!chartData[lvl]) chartData[lvl] = { level: lvl };
        chartData[lvl][Labels.class] = Value;
    });
    const data = Object.values(chartData).sort((a, b) => Number(a.level) - Number(b.level));

    return (
        <div className="panel-root">
            <h2 className="progression-panel-title">
                {filters.faction ? (
                    <img
                        src={`${import.meta.env.BASE_URL}icons/factions/${filters.faction === 'alliance' ? 'Alliance' : 'Horde'}.svg`}
                        alt={filters.faction}
                        width={32}
                        height={32}
                        style={{ marginRight: '8px' }}
                    />
                ) : (
                    <span style={{ width: 40, display: 'inline-block' }} />
                )}
                Population Progression
                <span style={{ width: 40, display: 'inline-block' }} />
            </h2>
            <div className="panel-layout" style={{ flex: 1, minHeight: 0 }}>
                <div className="panel-main">
                    {error && <p>Error loading progression data</p>}
                    <div className="chart-aspect-wrapper">
                        <div className="content-wrapper" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <XAxis dataKey="level" type="number" domain={[1, 60]} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend content={({ payload }) => (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                                            {payload.map(entry => (
                                                <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: CLASS_COLORS[entry.value] }}>
                                                    <img
                                                        src={`${import.meta.env.BASE_URL}icons/classes/${entry.value}.svg`}
                                                        alt={entry.value}
                                                        width={20}
                                                        height={20}
                                                        style={{ verticalAlign: 'middle' }}
                                                    />
                                                    {entry.value}
                                                </div>
                                            ))}
                                        </div>
                                    )} />
                                    {ALL_CLASSES.map(cls => (
                                        <Bar key={cls} dataKey={cls} stackId="a" fill={CLASS_COLORS[cls]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="panel-controls-overlay" ref={controlsRef}>
                    <div className="panel-controls">
                        {controlsOpen && (
                            <div className="panel-controls-content">
                                <fieldset>
                                    <legend>Timeline</legend>
                                    <ProgressionTimeline
                                        timeline={timeline}
                                        onTimelineChange={updateTimeline}
                                        timestamps={timestamps}
                                        onChange={setScrapeId}
                                    />
                                </fieldset>

                                <hr className="section-divider" />

                                <fieldset>
                                    <legend>Filters</legend>
                                    <ProgressionFilters filters={filters} onChange={setFilters} />
                                </fieldset>
                            </div>
                        )}
                    </div>
                    <CollapseHandle
                        orientation="vertical"
                        isOpen={controlsOpen}
                        onToggle={() => setControlsOpen(o => !o)}
                    />
                </div>
            </div>
        </div>
    );
}