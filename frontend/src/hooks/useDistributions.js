import { useState, useEffect } from 'react';
import { fetchDistribution } from '../api/distributions';

const POLL_INTERVAL = Number(import.meta.env.VITE_DATABASE_POLL_INTERVAL_MS) || 15000;

export function useDistribution(endpoint) {
    const [distribution, setDistribution] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDistribution(endpoint).then(setDistribution).catch(setError);

        const id = setInterval(() => {
            fetchDistribution(endpoint).then(setDistribution).catch(setError);
        }, POLL_INTERVAL);

        return () => clearInterval(id);
    }, []);

    return { distribution, error };
}
