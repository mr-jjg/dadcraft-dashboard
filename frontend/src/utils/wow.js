// Races
export const ALLIANCE_RACES   = ['Human', 'Dwarf', 'Night Elf', 'Gnome'];
export const HORDE_RACES      = ['Orc', 'Undead', 'Tauren', 'Troll'];
export const ALL_RACES        = [...ALLIANCE_RACES, ...HORDE_RACES];

// Classes
export const ALLIANCE_CLASSES = ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Warlock', 'Druid'];
export const HORDE_CLASSES    = ['Warrior', 'Shaman', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Warlock', 'Druid'];
export const ALL_CLASSES      = ['Warrior','Paladin','Hunter','Rogue','Priest','Shaman','Mage','Warlock','Druid'];

// Race <-> Class relationships
export const CLASS_RACES = {
    Warrior: ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Tauren', 'Troll'],
    Paladin: ['Human', 'Dwarf'],
    Hunter:  ['Dwarf', 'Night Elf', 'Orc', 'Tauren', 'Troll'],
    Rogue:   ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Troll'],
    Priest:  ['Human', 'Dwarf', 'Night Elf', 'Undead', 'Troll'],
    Shaman:  ['Orc', 'Tauren', 'Troll'],
    Mage:    ['Human', 'Gnome', 'Undead', 'Troll'],
    Warlock: ['Human', 'Gnome', 'Orc', 'Undead'],
    Druid:   ['Night Elf', 'Tauren'],
};

// Derived from CLASS_RACES - maps each race to the classes it can play.
export const RACE_CLASSES = Object.entries(CLASS_RACES).reduce((acc, [cls, races]) => {
    races.forEach(race => {
        if (!acc[race]) acc[race] = [];
        acc[race].push(cls);
    });
    return acc;
}, {});

// Visuals
export const CLASS_COLORS = {
    Warrior: '#C79C6E',
    Paladin: '#F58CBA',
    Hunter:  '#ABD473',
    Rogue:   '#FFF569',
    Priest:  '#F0EEE0',
    Shaman:  '#0070DE',
    Mage:    '#69CCF0',
    Warlock: '#9482C9',
    Druid:   '#FF7D0A',
};
