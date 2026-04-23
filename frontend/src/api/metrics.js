export async function fetchMetric(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.value;
}
