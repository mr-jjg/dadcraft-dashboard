export const ONE_HOUR = 3600;
export const ONE_DAY  = 86400;
export const ONE_WEEK = 604800;

export const BUCKET_CONFIG = {
    '1D':  { duration: ONE_DAY  * 1,  interval: ONE_HOUR     }, // 1 per hour
    '1W':  { duration: ONE_DAY  * 7,  interval: ONE_HOUR * 6 }, // 4 per day
    '1M':  { duration: ONE_DAY  * 30, interval: ONE_DAY      }, // 1 per day
    '1Y':  { duration: ONE_WEEK * 52, interval: ONE_WEEK     }, // 1 per week
    'All': { duration: null,          interval: ONE_WEEK     }, // 1 per week, no duration
};

export function bucketTimestamps(timestamps, range, windowEnd = null) {
    if (!timestamps || timestamps.length === 0) return [];
    if (!BUCKET_CONFIG[range]) return timestamps;

    const { duration, interval } = BUCKET_CONFIG[range];
    const rangeEnd = windowEnd ?? timestamps[timestamps.length - 1].scraped_at;
    const inRange = duration
        ? timestamps.filter(t => t.scraped_at > rangeEnd - duration)
        : timestamps;

    return sampleAtInterval(inRange, interval);
}

// pick entries that are at least interval seconds apart
function sampleAtInterval(timestamps, interval) {
    if (!timestamps || timestamps.length === 0) return [];

    const result = [];
    let lastPicked = timestamps[0].scraped_at - interval;

    for (const t of timestamps) {
        if (t.scraped_at - lastPicked >= interval) {
            result.push(t);
            lastPicked = t.scraped_at;
        }
    }
    return result;
}
