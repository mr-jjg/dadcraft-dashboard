export async function fetchProgression(time, online, faction, race, characterClass, guild) {
    const params = new URLSearchParams();
    if (time) params.append('scrape_id', time);
    if (online) params.append('online', online);
    if (faction) params.append('faction', faction);
    if (race) params.append('race', race);
    if (characterClass) params.append('class', characterClass);
    if (guild) params.append('guild', guild);

    const response = await fetch(`/api/progression?${params}`);
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
}
