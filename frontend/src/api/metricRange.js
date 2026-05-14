export async function fetchMetricRange(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${endpoint}?${qs}` : endpoint;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.map(([ts, val]) => ({ time: ts, value: val }));
}
