import { useState, useEffect } from 'react';
import { fetchProgression } from '../api/progression';

export function useProgression(time, online, faction, race, characterClass) {
    const [progression, setProgression] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgression(time, online, faction, race, characterClass).then(setProgression).catch(setError)
    }, [time, online, faction, race, characterClass]);

    return { progression, error }
}
