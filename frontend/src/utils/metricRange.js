const CLEAN_STEPS = [15, 30, 60, 120, 300, 600, 900, 1800, 3600];
const TARGET_POINTS = 1440;

export function deriveStep(windowSeconds) {
    const raw = windowSeconds / TARGET_POINTS;
    return CLEAN_STEPS.find(s => s >= raw) ?? CLEAN_STEPS[CLEAN_STEPS.length - 1];
}

export function availableSteps(windowSeconds) {
    return CLEAN_STEPS.filter(s => {
        const points = windowSeconds / s;
        return points >= 60 && points <= TARGET_POINTS;
    });
}

export { CLEAN_STEPS, TARGET_POINTS };
