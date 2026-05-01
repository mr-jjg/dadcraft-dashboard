import { useState, useEffect } from 'react';
import { fetchTable } from '../api/tables';

const POLL_INTERVAL = Number(import.meta.env.VITE_DATABASE_POLL_INTERVAL_MS) || 15000;

export function useTable(endpoint) {
    const [table, setTable] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTable(endpoint).then(setTable).catch(setError);

        const id = setInterval(() => {
            fetchTable(endpoint).then(setTable).catch(setError);
        }, POLL_INTERVAL);

        return () => clearInterval(id);
    }, []);

    return { table, error };
}
