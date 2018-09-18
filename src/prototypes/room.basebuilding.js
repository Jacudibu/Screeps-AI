global.baseLayouts = {};
require('layouts.diamond14x14');

const STRUCTURE_PRIORITIES = [
    // Essentials
    STRUCTURE_SPAWN + "s",
    STRUCTURE_EXTENSION + "s",
    STRUCTURE_TOWER + "s",

    // Nice To Have
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER + "s",
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LINK + "s",
    STRUCTURE_LAB + "s",
    STRUCTURE_ROAD + "s",
    STRUCTURE_RAMPART + "s",
    STRUCTURE_WALL + "s",

    // Fluff
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_NUKER,
];

Room.prototype.checkAndPlaceConstructionSites = function() {
    if (this.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        return;
    }
};

Room.prototype._checkIfSomethingNeedsToBeBuilt = function() {
    const layout = baseLayouts.diamond14x14;

    for (let i = 0; i < STRUCTURE_PRIORITIES.length; i++) {
        this._checkIfStructureTypeNeedsToBeBuilt(STRUCTURE_PRIORITIES[i]);
    }

    // TODO: Ramparts
};

Room.prototype._checkIfStructureTypeNeedsToBeBuilt = function(structureType) {
};