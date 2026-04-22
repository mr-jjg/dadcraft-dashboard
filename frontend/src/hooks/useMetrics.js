import { useState, useEffect } from 'react';
import { fetchCpu } from '../api/metrics';

export function useCpu() {
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCpu().then(setValue).catch(setError);
    }, []);

    return { value, error };
}
