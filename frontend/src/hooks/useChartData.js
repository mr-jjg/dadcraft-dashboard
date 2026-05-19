// frontend/src/hooks/useChartData.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMetricRange } from '../api/metricRange';
import { mergeByTime } from '../utils/chart';
import { deriveStep } from '../utils/metricRange';

const DEFAULT_LOOKBACK = 90 * 24 * 3600;
const DEBOUNCE_MS = 500;

async function fetchAllLines(lines, start, end, step) {
    const results = await Promise.all(
        lines.map(({ key, endpoint }) =>
            fetchMetricRange(endpoint, { start, end, step })
                .then(data => ({ key, data }))
        )
    );
    return mergeByTime(results);
}

export function useChartData(lines, maxLookback = DEFAULT_LOOKBACK, stepOverride = null) {
    const [overviewData, setOverviewData] = useState([]);
    const [detailData, setDetailData]     = useState([]);
    const [overviewError, setOverviewError] = useState(null);
    const [detailError, setDetailError]     = useState(null);
    const [windowSeconds, setWindowSeconds] = useState(maxLookback);

    const debounceRef = useRef(null);
    const brushWindowRef = useRef({ start: null, end: null })

    const linesKey = JSON.stringify(lines);

    // overview fetch - fires when lines change
    useEffect(() => {
        if (!lines || lines.length === 0) {
            setOverviewData([]);
            setDetailData([]);
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const start = now - maxLookback;
        const step = deriveStep(maxLookback);

        fetchAllLines(lines, start, now, step)
            .then(data => {
                setOverviewData(data);
                setOverviewError(null);
            })
            .catch(err => setOverviewError(err));

    }, [linesKey, maxLookback]);

    // detail fetch - fires when lines change or brush settles
    const fetchDetail = useCallback((startTs, endTs) => {
        if (!lines || lines.length === 0) return;
        const window = endTs - startTs;
        const step = stepOverride ?? deriveStep(window);

        fetchAllLines(lines, startTs, endTs, step)
            .then(data => {
                setDetailData(data);
                setDetailError(null);
                setWindowSeconds(endTs - startTs);
                brushWindowRef.current = { start: startTs, end: endTs }
            })
            .catch(err => setDetailError(err));
    }, [linesKey, stepOverride]);

    // on lines change, re-run detail fetch over the preserved window
    useEffect(() => {
        if (!lines || lines.length === 0) return;
        const now = Math.floor(Date.now() / 1000);
        fetchDetail(now - windowSeconds, now);
    }, [linesKey]);

    useEffect(() => {
        if (!lines || lines.length === 0) return;
        const { start, end } = brushWindowRef.current
        const now = Math.floor(Date.now() / 1000)
        fetchDetail(start ?? now - windowSeconds, end ?? now)
    }, [stepOverride])

    const onBrushChange = useCallback(({ startIndex, endIndex }) => {
        if (!overviewData.length) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const startTs = overviewData[startIndex]?.time;
            const endTs   = overviewData[endIndex]?.time;
            if (startTs && endTs) fetchDetail(startTs, endTs);
        }, DEBOUNCE_MS);
    }, [overviewData, fetchDetail]);

    return {
        overviewData,
        detailData,
        overviewError,
        detailError,
        windowSeconds,
        onBrushChange,
    };
}
