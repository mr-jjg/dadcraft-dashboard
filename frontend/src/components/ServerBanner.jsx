import { useTable } from '../hooks/useTables';

const STATS = [
    { label: 'Characters', endpoint: '/api/db/characters/count' },
    { label: 'Online',     endpoint: '/api/db/characters/online' },
    { label: 'Guilds',     endpoint: '/api/db/guilds' },
    { label: 'Auctions',   endpoint: '/api/db/auctions' },
    { label: 'GM Tickets', endpoint: '/api/db/tickets' },
]

function StatCell({ label, endpoint }) {
    const { table, error } = useTable(endpoint);
    const value = error ? 'Error' : table == null ? '...' : table.rows[0][0];
    return (
        <div>
            <span>{label}: </span>
            <span>{value}</span>
        </div>
    );
}

export function ServerBanner() {
    return (
        <div style={{ display: 'flex', gap: '16px' }}>
            {STATS.map(s => (
                <StatCell key={s.label} label={s.label} endpoint={s.endpoint} />
            ))}
        </div>
    );
}
