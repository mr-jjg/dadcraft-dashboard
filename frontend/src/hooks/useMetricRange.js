import { useState, useEffect } from 'react';
import { fetchMetricRange } from '../api/metricRange';

const POLL_INTERVAL = 300000;

export function useMetricRange(endpoint, params = {}) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const { start, end, step } = params;

    useEffect(() => {
        fetchMetricRange(endpoint, params).then(setData).catch(setError);

        const id = setInterval(() => {
            fetchMetricRange(endpoint, params).then(setData).catch(setError);
        }, POLL_INTERVAL);

        return () => clearInterval(id);
    }, [endpoint, start, end, step]);

    return { data, error };
}
