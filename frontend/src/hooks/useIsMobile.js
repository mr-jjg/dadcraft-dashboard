import { useState, useEffect } from 'react'

const MOBILE_QUERY = '(max-width: 960px) and (orientation: landscape)'

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(MOBILE_QUERY).matches
    )

    useEffect(() => {
        const mql = window.matchMedia(MOBILE_QUERY)
        const handler = (e) => setIsMobile(e.matches)
        mql.addEventListener('change', handler)
        return () => mql.removeEventListener('change', handler)
    }, [])

    return isMobile
}
