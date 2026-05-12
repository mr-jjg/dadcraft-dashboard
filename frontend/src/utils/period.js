export function snapToPeriodStart(date, range) {
    const d = new Date(date);
    switch (range) {
        case '1D':
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        case '1W': {
            const day = d.getDay(); // 0 = Sunday
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
        }
        case '1M':
            return new Date(d.getFullYear(), d.getMonth(), 1);
        case '1Y':
            return new Date(d.getFullYear(), 0, 1);
        default:
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
}

export function stepPeriod(date, range, direction) {
    const d = new Date(date);
    switch (range) {
        case '1D':
            return snapToPeriodStart(new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction), range);
        case '1W':
            return snapToPeriodStart(new Date(d.getFullYear(), d.getMonth(), d.getDate() + (7 * direction)), range);
        case '1M':
            return snapToPeriodStart(new Date(d.getFullYear(), d.getMonth() + direction, 1), range);
        case '1Y':
            return snapToPeriodStart(new Date(d.getFullYear() + direction, 0, 1), range);
        default:
            return date;
    }
}

export function periodEnd(periodStart, range) {
    const d = new Date(periodStart);
    switch (range) {
        case '1D':
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() / 1000;
        case '1W':
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getTime() / 1000;
        case '1M':
            return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() / 1000;
        case '1Y':
            return new Date(d.getFullYear() + 1, 0, 1).getTime() / 1000;
        default:
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() / 1000;
    }
}

export function periodLabel(periodStart, range) {
    const d = periodStart;
    const fmt = (date, opts) => date.toLocaleDateString('en-US', opts);
    switch (range) {
        case '1D':
            return fmt(d, { month: '2-digit', day: '2-digit', year: '2-digit' });
        case '1W': {
            const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6);
            return `${fmt(d, { month: '2-digit', day: '2-digit', year: '2-digit' })} - ${fmt(end, { month: '2-digit', day: '2-digit', year: '2-digit' })}`;
        }
        case '1M':
            return fmt(d, { month: 'long', year: 'numeric' });
        case '1Y':
            return fmt(d, { year: 'numeric' });
        default:
            return '';
    }
}
