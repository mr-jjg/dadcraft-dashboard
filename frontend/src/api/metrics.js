export async function fetchCpu() {
    const response = await fetch('/api/cpu');
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.value;
}
