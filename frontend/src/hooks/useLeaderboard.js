import { useState, useEffect, useRef } from 'react'
import { fetchLeaderboard } from '../api/leaderboard'

const POLL_INTERVAL = Number(import.meta.env.VITE_DATABASE_POLL_INTERVAL_MS) || 15000

export function useLeaderboard(sort) {
    const [entries, setEntries] = useState(null)
    const [error, setError] = useState(null)
    const lastJson = useRef(null)

    useEffect(() => {
        setEntries(null)
        lastJson.current = null

        const load = () => {
            fetchLeaderboard(sort)
                .then(data => {
                    const json = JSON.stringify(data)
                    if (json !== lastJson.current) {
                        lastJson.current = json
                        setEntries(data)
                    }
                })
                .catch(setError)
        }

        load()
        const id = setInterval(load, POLL_INTERVAL)
        return () => clearInterval(id)
    }, [sort])

    return { entries, error }
}
