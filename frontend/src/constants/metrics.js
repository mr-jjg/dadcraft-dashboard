export const MEMORY_AND_SWAP = [
    { key: 'Memory', endpoint: '/api/system/memory/range', color: '#d4920a' },
    { key: 'Swap',   endpoint: '/api/system/swap/range',   color: '#b47a9a' },
]

export const LOAD_LINES = [
    { key: 'Load (1m)',  endpoint: '/api/system/load1/range',  color: '#d4920a' },
    { key: 'Load (5m)',  endpoint: '/api/system/load5/range',  color: '#b47a9a' },
    { key: 'Load (15m)', endpoint: '/api/system/load15/range', color: '#b8b0c8' },
]

export const METRICS = [
    { label: 'CPU',           endpoint: '/api/system/cpu',     unit: '%', precision: 1,  group: 'system',
      lines: [{ key: 'CPU', endpoint: '/api/system/cpu/range', color: '#d4920a' }] },
    { label: 'Game Server CPU',    endpoint: '/api/mangosd/cpu',    unit: '%',  precision: 1, group: 'gameserver',
      lines: [{ key: 'Game Server CPU', endpoint: '/api/mangosd/cpu/range', color: '#d4920a' }] },
    { label: 'Game Server Memory', endpoint: '/api/mangosd/memory', unit: ' MB',              group: 'gameserver',
      lines: [{ key: 'Game Server Memory', endpoint: '/api/mangosd/memory/range', color: '#d4920a' }] },
    { label: 'Memory',        endpoint: '/api/system/memory',  unit: '%', precision: 1,  group: 'memory', lines: MEMORY_AND_SWAP },
    { label: 'Swap',          endpoint: '/api/system/swap',    unit: '%', precision: 1,  group: 'memory', lines: MEMORY_AND_SWAP },
    { label: 'Disk',          endpoint: '/api/system/disk',    unit: '%', precision: 1,  group: 'storage',
      lines: [{ key: 'Disk', endpoint: '/api/system/disk/range', color: '#d4920a' }] },
    { label: 'I/O Wait',      endpoint: '/api/system/io',      unit: '%', precision: 1,  group: 'storage',
      lines: [{ key: 'I/O Wait', endpoint: '/api/system/io/range', color: '#d4920a' }] },
    { label: 'Network In',  endpoint: '/api/system/rx', unit: ' B/s', group: 'network',
      lines: [{ key: 'Network In',  endpoint: '/api/system/rx/range', color: '#d4920a' }] },
    { label: 'Network Out', endpoint: '/api/system/tx', unit: ' B/s', group: 'network',
      lines: [{ key: 'Network Out', endpoint: '/api/system/tx/range', color: '#b47a9a' }] },
    { label: 'Load (1m)',     endpoint: '/api/system/load1',   unit: '', precision: 1,   group: 'load', lines: LOAD_LINES },
    { label: 'Load (5m)',     endpoint: '/api/system/load5',   unit: '', precision: 1,   group: 'load', lines: LOAD_LINES },
    { label: 'Load (15m)',    endpoint: '/api/system/load15',  unit: '', precision: 1,   group: 'load', lines: LOAD_LINES },
]
