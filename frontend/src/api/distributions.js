export async function fetchDistribution(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`${response.status}`);
    const distribution = await response.json();
    return distribution;
}
