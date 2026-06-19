import { useRef, useState, useEffect } from 'react';
import { useMetric } from '../hooks/useMetrics';
import { useTable } from '../hooks/useTables';
import { formatTimeHM } from '../utils/format';
import { CollapseHandle } from './CollapseHandle'
import { THEMES } from '../constants/themes'

const TABLE_STATS  = [
    { label: 'Characters', endpoint: '/api/db/characters/count' },
    { label: 'Online',     endpoint: '/api/db/characters/online' },
    { label: 'Guilds',     endpoint: '/api/db/guilds' },
    { label: 'Auctions',   endpoint: '/api/db/auctions' },
    { label: 'GM Tickets', endpoint: '/api/db/tickets' },
]

const UPTIME_STATS = [
    { label: 'System Uptime',      endpoint: '/api/system/uptime' },
    { label: 'Game Server Uptime', endpoint: '/api/mangosd/uptime' },
]

function TableStat({ label, endpoint }) {
    const { table, error } = useTable(endpoint);
    const value = error ? 'Error' : table == null ? '...' : table.rows[0][0];
    return <span>{label}: {value}</span>;
}

function UptimeStat({ label, endpoint }) {
    const { value, error } = useMetric(endpoint);
    const formatted = error ? 'Error' : value == null ? '...' : formatTimeHM(value);
    return <span>{label}: {formatted}</span>;
}

function getInitialTheme() {
    return localStorage.getItem('skin') ?? 'azshara'
}

export function ServerBanner() {
    const [isOpen, setIsOpen] = useState(true)
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('skin', theme)
    }, [theme])

    return (
        <div className="server-banner">
            {isOpen && (
                <div className="server-banner-inner">
                    <div className="server-banner-content">
                        <h1 style={{ margin: 0 }}>Dadcraft Dashboard</h1>
                        <div className="server-banner-stats">
                            <div className="server-banner-stat-row">
                                {TABLE_STATS.map(s => <TableStat key={s.label} label={s.label} endpoint={s.endpoint} />)}
                            </div>
                            <div className="server-banner-stat-row">
                                {UPTIME_STATS.map(s => <UptimeStat key={s.label} label={s.label} endpoint={s.endpoint} />)}
                            </div>
                        </div>
                    </div>
                    <div className="server-banner-aside">
                        <img
                            className="server-banner-expansion"
                            src={`${import.meta.env.BASE_URL}icons/expansions/${import.meta.env.VITE_EXPANSION}.svg`}
                            alt={import.meta.env.VITE_EXPANSION}
                        />
                        <select
                            value={theme}
                            onChange={e => setTheme(e.target.value)}
                            aria-label="Theme"
                        >
                            {THEMES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            <div className="server-banner-collapse">
                <CollapseHandle
                    orientation="horizontal"
                    isOpen={isOpen}
                    onToggle={() => setIsOpen(f => !f)}
                />
            </div>
        </div>
    );
}
