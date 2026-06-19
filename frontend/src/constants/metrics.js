const PRIMARY   = 'var(--color-primary)'
const SECONDARY = 'var(--color-secondary)'
const TERTIARY  = 'var(--color-danger)'

export const GROUPS = {
    system:     'System',
    gameserver: 'Game Server',
    memory:     'Memory',
    storage:    'Storage',
    network:    'Network',
    load:       'Load',
}

export const MEMORY_AND_SWAP = [
    { key: 'Memory', endpoint: '/api/system/memory/range', color: PRIMARY },
    { key: 'Swap',   endpoint: '/api/system/swap/range',   color: SECONDARY },
]

export const LOAD = [
    { key: 'Load (1m)',  endpoint: '/api/system/load1/range',  color: PRIMARY },
    { key: 'Load (5m)',  endpoint: '/api/system/load5/range',  color: SECONDARY },
    { key: 'Load (15m)', endpoint: '/api/system/load15/range', color: TERTIARY },
]

export const NETWORK = [
    { key: 'Network In',  endpoint: '/api/system/rx/range', color: PRIMARY },
    { key: 'Network Out', endpoint: '/api/system/tx/range', color: SECONDARY },
]

export const METRICS = [
    { label: 'CPU',           endpoint: '/api/system/cpu',     unit: '%', precision: 1,  group: 'system',
      lines: [{ key: 'CPU', endpoint: '/api/system/cpu/range', color: PRIMARY }] },
    { label: 'CPU',    endpoint: '/api/mangosd/cpu',    unit: '%',  precision: 1, group: 'gameserver',
      lines: [{ key: 'Game Server CPU', endpoint: '/api/mangosd/cpu/range', color: PRIMARY }] },
    { label: 'Memory', endpoint: '/api/mangosd/memory', unit: ' MB',              group: 'gameserver',
      lines: [{ key: 'Game Server Memory', endpoint: '/api/mangosd/memory/range', color: PRIMARY }] },
    { label: 'Memory',        endpoint: '/api/system/memory',  unit: '%', precision: 1,  group: 'memory', lines: MEMORY_AND_SWAP },
    { label: 'Swap',          endpoint: '/api/system/swap',    unit: '%', precision: 1,  group: 'memory', lines: MEMORY_AND_SWAP },
    { label: 'Disk',          endpoint: '/api/system/disk',    unit: '%', precision: 1,  group: 'storage',
      lines: [{ key: 'Disk', endpoint: '/api/system/disk/range', color: PRIMARY }] },
    { label: 'I/O Wait',      endpoint: '/api/system/io',      unit: '%', precision: 1,  group: 'storage',
      lines: [{ key: 'I/O Wait', endpoint: '/api/system/io/range', color: PRIMARY }] },
    { label: 'In',  endpoint: '/api/system/rx', unit: ' B/s', group: 'network', lines: NETWORK },
    { label: 'Out', endpoint: '/api/system/tx', unit: ' B/s', group: 'network', lines: NETWORK },
    { label: 'Load (1m)',     endpoint: '/api/system/load1',   unit: '', precision: 1,   group: 'load', lines: LOAD },
    { label: 'Load (5m)',     endpoint: '/api/system/load5',   unit: '', precision: 1,   group: 'load', lines: LOAD },
    { label: 'Load (15m)',    endpoint: '/api/system/load15',  unit: '', precision: 1,   group: 'load', lines: LOAD },
]
