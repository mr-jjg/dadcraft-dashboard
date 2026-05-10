export const ONE_HOUR = 3600;
export const ONE_DAY  = 86400;
export const ONE_WEEK = 604800;

export const BUCKET_CONFIG = {
    '1D': { window: ONE_DAY  * 1,  gap: ONE_HOUR     }, // 1 per hour
    '1W': { window: ONE_DAY  * 7,  gap: ONE_HOUR * 6 }, // 4 per day
    '1M': { window: ONE_DAY  * 30, gap: ONE_DAY      }, // 1 per day
    '1Y': { window: ONE_WEEK * 52, gap: ONE_WEEK     }, // 1 per week
    'All': { window: null,          gap: ONE_WEEK     }, // 1 per week, no window
};

export function bucketTimestamps(timestamps, range, anchor = null) {
    if (!timestamps || timestamps.length === 0) return [];

    const config = BUCKET_CONFIG[range];
    if (!config) return timestamps;

    const { window, gap } = config;
    const now = anchor ?? timestamps[timestamps.length - 1].scraped_at;

    const inWindow = window
        ? timestamps.filter(t => t.scraped_at > now - window)
        : timestamps;

    return pickEveryN(inWindow, gap);
}

// pick entries that are at least gap seconds apart
function pickEveryN(timestamps, gap) {
    if (!timestamps || timestamps.length === 0) return [];
    const result = [];
    let lastPicked = timestamps[0].scraped_at - gap;
    for (const t of timestamps) {
        if (t.scraped_at - lastPicked >= gap) {
            result.push(t);
            lastPicked = t.scraped_at;
        }
    }
    return result;
}
