export async function fetchMetricRange(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    const chartData = data.map(([ts, val]) => ({ "time": ts, "value": val }));
    return chartData;
}
