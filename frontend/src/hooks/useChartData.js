// frontend/src/hooks/useChartData.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMetricRange } from '../api/metricRange';
import { mergeByTime } from '../utils/chart';
import { deriveStep } from '../utils/metricRange';

const DEFAULT_LOOKBACK = 90 * 24 * 3600;
const DEBOUNCE_MS = 300;

async function fetchAndMergeLines(lines, start, end, step) {
    const results = await Promise.all(
        lines.map(({ key, endpoint }) =>
            fetchMetricRange(endpoint, { start, end, step })
                .then(data => ({ key, data }))
        )
    );
    return mergeByTime(results);
}

const findIndex = (data, ts) =>
    data.reduce((best, _, i) =>
        Math.abs(data[i].time - ts) < Math.abs(data[best].time - ts) ? i : best
    , 0)

export function useChartData(lines, maxLookback = DEFAULT_LOOKBACK, stepOverride = null) {
    const [overviewData, setOverviewData] = useState([]);
    const [detailData, setDetailData]     = useState([]);
    const [overviewError, setOverviewError] = useState(null);
    const [detailError, setDetailError]     = useState(null);
    const [windowSeconds, setWindowSeconds] = useState(maxLookback);
    const [brushWindow, setBrushWindow]     = useState({ start: null, end: null });
    const [brushIndices, setBrushIndices] = useState({ start: undefined, end: undefined })
    const [brushKey, setBrushKey] = useState(0);

    const debounceRef = useRef(null);
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

        fetchAndMergeLines(lines, start, now, step)
            .then(data => {
                setOverviewData(data);
                setOverviewError(null);
                if (brushWindow.start && brushWindow.end) {
                    setBrushIndices({
                        start: findIndex(data, brushWindow.start),
                        end: findIndex(data, brushWindow.end),
                    });
                    setBrushKey(k => k + 1);
                }
            })
            .catch(err => setOverviewError(err));

    }, [linesKey, maxLookback]);

    // detail fetch - fires when lines, brush window, or step override changes
    useEffect(() => {
        if (!lines || lines.length === 0) return;

        const now = Math.floor(Date.now() / 1000);
        const start = brushWindow.start ?? now - windowSeconds;
        const end = brushWindow.end ?? now;
        const window = end - start;
        const step = stepOverride ?? deriveStep(window);

        fetchAndMergeLines(lines, start, end, step)
            .then(data => {
                setDetailData(data);
                setDetailError(null);
                setWindowSeconds(window);
            })
            .catch(err => setDetailError(err));

    }, [linesKey, brushWindow, stepOverride]);

    const onBrushChange = useCallback(({ startIndex, endIndex }) => {
        if (!overviewData.length) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const startTs = overviewData[startIndex]?.time;
            const endTs   = overviewData[endIndex]?.time;
            if (startTs && endTs) setBrushWindow({ start: startTs, end: endTs });
        }, DEBOUNCE_MS);
    }, [overviewData]);

    return {
        overviewData,
        detailData,
        overviewError,
        detailError,
        windowSeconds,
        onBrushChange,
        brushStart: brushIndices.start,
        brushEnd: brushIndices.end,
        brushKey,
    };
}
