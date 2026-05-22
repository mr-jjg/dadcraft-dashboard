export const QUICK_SEARCHES = [
    {
        label: 'Lifetime Honor Leaders',
        filters: [
            { id: -1, field: 'lifetime_honorable_kills', op: 'range', value: '', min: 1, max: '', values: [] },
        ],
        orderBy: 'lifetime_honorable_kills',
        orderDir: 'desc',
        limit: 20,
        visibleCols: ['name', 'faction', 'race', 'class', 'lifetime_honorable_kills', 'lifetime_honor']
    },
    {
        label: 'Weekly Honor Leaders',
        filters: [
            { id: -1, field: 'week_honorable_kills', op: 'range', value: '', min: 1, max: '', values: [] },
        ],
        orderBy: 'week_honor',
        orderDir: 'desc',
        limit: 20,
        visibleCols: ['name', 'faction', 'race', 'class', 'week_honorable_kills', 'week_honor']
    },
    {
        label: 'Guild Leaders',
        filters: [
            { id: -1, field: 'is_guild_leader', op: 'eq', value: '1', min: '', max: '', values: [] },
        ],
        orderBy: 'guild',
        orderDir: 'asc',
        limit: 20,
        visibleCols: ['name', 'faction', 'zone', 'online', 'guild']
    },
    {
        label: 'Alliance Tanks Online',
        filters: [
            { id: -1, field: 'faction', op: 'in', value: '', min: '', max: '', values: ['Alliance'] },
            { id: -2, field: 'class', op: 'in', value: '', min: '', max: '', values: ['Warrior', 'Paladin', 'Druid'] },
            { id: -3, field: 'online', op: 'eq', value: '1', min: '', max: '', values: [] },
        ],
        orderBy: 'class',
        orderDir: 'asc',
        limit: 20,
        visibleCols: ['name', 'race', 'class', 'level', 'zone', 'guild']
    },
    {
        label: 'Horde Healers Online',
        filters: [
            { id: -1, field: 'faction', op: 'in', value: '', min: '', max: '', values: ['Horde'] },
            { id: -2, field: 'class', op: 'in', value: '', min: '', max: '', values: ['Priest', 'Shaman', 'Druid'] },
            { id: -3, field: 'online', op: 'eq', value: '1', min: '', max: '', values: [] },
        ],
        orderBy: 'class',
        orderDir: 'asc',
        limit: 20,
        visibleCols: ['name', 'race', 'class', 'level', 'zone', 'guild']
    },
    {
        label: 'Horde Leveling 12-29',
        filters: [
            { id: -1, field: 'faction', op: 'in', value: '', min: '', max: '', values: ['Horde'] },
            { id: -2, field: 'level', op: 'range', value: '', min: 12, max: 29, values: [] },
            { id: -3, field: 'zone', op: 'in', value: '', min: '', max: '', values: ['Barrens', 'Stonetalon', 'Ashenvale', 'Needles'] },
            { id: -4, field: 'online', op: 'eq', value: '1', min: '', max: '', values: [] },
        ],
        orderBy: 'zone',
        orderDir: 'asc',
        limit: 20,
        visibleCols: ['name', 'race', 'class', 'level', 'zone']
    },
]
