export async function fetchTable(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`${response.status}`);
    const table = await response.json();
    return table;
}
