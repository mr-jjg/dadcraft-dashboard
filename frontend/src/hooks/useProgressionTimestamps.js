import { useState, useEffect } from 'react';
import { fetchProgressionTimestamps } from '../api/progressionTimestamps';

export function useProgressionTimestamps() {
    const [timestamps, setTimestamps] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgressionTimestamps().then(setTimestamps).catch(setError);
    }, []);

    return { timestamps, error };
}
