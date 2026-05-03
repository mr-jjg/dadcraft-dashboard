import { useState, useEffect } from 'react';
import { fetchMetricRange } from '../api/metricRange';

// TODO: accept start, end, step as query parameters to match backend GetMetricRange
const POLL_INTERVAL = 300000;

export function useMetricRange(endpoint) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMetricRange(endpoint).then(setData).catch(setError);

        const id = setInterval(() => {
            fetchMetricRange(endpoint).then(setData).catch(setError);
        }, POLL_INTERVAL);

        return () => clearInterval(id);
    }, []);

    return { data, error };
}
