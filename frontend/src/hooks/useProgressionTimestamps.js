import { useState, useEffect } from 'react';

export function useProgressionTimestamps() {
    const [timestamps, setTimestamps] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/progression/timestamps')
            .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
            .then(setTimestamps)
            .catch(setError);
    }, []);

    return { timestamps, error };
}
