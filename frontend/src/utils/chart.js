export function mergeByTime(series) {
    const merged = {};
    for (const { key, data } of series) {
        for (const { time, value } of (data || [])) {
            if (!merged[time]) merged[time] = { time };
            merged[time][key] = value;
        }
    }
    return Object.values(merged).sort((a, b) => a.time - b.time);
}