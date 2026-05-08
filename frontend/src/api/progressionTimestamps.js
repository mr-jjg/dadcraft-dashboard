export async function fetchProgressionTimestamps() {
    const response = await fetch('/api/progression/timestamps');
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
}
