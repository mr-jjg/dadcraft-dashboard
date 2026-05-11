import { CLASS_RACES, RACE_CLASSES, ALL_RACES, ALL_CLASSES } from './wow'

test('RACE_CLASSES is derived correctly from CLASS_RACES', () => {
    for (const [cls, races] of Object.entries(CLASS_RACES)) {
        for (const race of races) {
            expect(RACE_CLASSES[race]).toContain(cls)
        }
    }
})

test('every race in CLASS_RACES exists in ALL_RACES', () => {
    const racesInClassRaces = new Set(Object.values(CLASS_RACES).flat())
    for (const race of racesInClassRaces) {
        expect(ALL_RACES).toContain(race)
    }
})

test('every class in CLASS_RACES exists in ALL_CLASSES', () => {
    for (const cls of Object.keys(CLASS_RACES)) {
        expect(ALL_CLASSES).toContain(cls)
    }
})
