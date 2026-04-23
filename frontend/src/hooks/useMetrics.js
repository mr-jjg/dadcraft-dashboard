import { useState, useEffect } from 'react';
import { fetchMetric } from '../api/metrics';

const POLL_INTERVAL = Number(import.meta.env.VITE_PROMETHEUS_POLL_INTERVAL_MS) || 15000;

export function useMetric(endpoint) {
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMetric(endpoint).then(setValue).catch(setError);

        const id = setInterval(() => {
            fetchMetric(endpoint).then(setValue).catch(setError);
        }, POLL_INTERVAL);

        return () => clearInterval(id);
    }, []);

    return { value, error };
}
