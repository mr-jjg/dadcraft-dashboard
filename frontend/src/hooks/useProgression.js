import { useState, useEffect } from 'react';
import { fetchProgression } from '../api/progression';

export function useProgression(time, online, faction, race, characterClass, guild) {
    const [progression, setProgression] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgression(time, online, faction, race, characterClass, guild).then(setProgression).catch(setError)
    }, [time, online, faction, race, characterClass, guild]);

    return { progression, error }
}
