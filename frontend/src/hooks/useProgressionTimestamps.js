import { useState, useEffect } from 'react';
import { fetchProgressionTimestamps } from '../api/progressionTimestamps';

const POLL_INTERVAL = Number(import.meta.env.VITE_PROGRESSION_POLL_INTERVAL_MS) || 1800000;

export function useProgressionTimestamps() {
    const [timestamps, setTimestamps] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgressionTimestamps().then(setTimestamps).catch(setError);

        const id = setInterval(() => {
            fetchProgressionTimestamps().then(setTimestamps).catch(setError);
        }, POLL_INTERVAL);

        return () => clearInterval(id);
    }, []);

    return { timestamps, error };
}
