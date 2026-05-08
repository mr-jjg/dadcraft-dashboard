import { useState, useEffect } from 'react';
import { fetchProgression } from '../api/progression';

export function useProgression(scrape_id, online, faction, race, characterClass, guild) {
    const [progression, setProgression] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgression(scrape_id, online, faction, race, characterClass, guild).then(setProgression).catch(setError)
    }, [scrape_id, online, faction, race, characterClass, guild]);

    return { progression, error }
}
