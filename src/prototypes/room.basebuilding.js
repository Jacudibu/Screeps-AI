global.baseLayouts = {};
require('layouts.diamond14x14');

const STRUCTURE_PRIORITIES = [
    // Essentials
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,

    // Nice To Have
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LINK,
    STRUCTURE_LAB,
    STRUCTURE_ROAD,
    STRUCTURE_RAMPART,
    STRUCTURE_WALL,

    // Fluff
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_NUKER,
];

const STATUS = {
    SUCCESSFULLY_PLACED_CONSTRUCTION_SITE: 0,

    ERR_ALREADY_AT_RCL_LIMIT: 1,
    ERR_ALREADY_AT_LAYOUT_LIMIT: 2,
    ERR_NO_SUITABLE_SITES_FOUND: 3,
    ERR_EVERYTHING_BUILT: 4,

    ERR_NOT_YET_IMPLEMENTED: 42,
    ERR_UNDEFINED: 999,
};

Room.prototype.automaticallyPlaceConstructionSites = function() {
    if (!this.memory.layout) {
        return;
    }

    if (this.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        return;
    }

    const layout = baseLayouts.diamond14x14;
    this._checkIfSomethingNeedsToBeBuilt(layout);
};

Room.prototype._checkIfSomethingNeedsToBeBuilt = function(layout) {
    let result = STATUS.ERR_UNDEFINED;
    for (let i = 0; i < STRUCTURE_PRIORITIES.length; i++) {
        result = this._checkIfStructureTypeNeedsToBeBuilt(STRUCTURE_PRIORITIES[i], layout);

        if (result === STATUS.SUCCESSFULLY_PLACED_CONSTRUCTION_SITE) {
            return result;
        }
    }

    return STATUS.ERR_EVERYTHING_BUILT;
};

Room.prototype._checkIfStructureTypeNeedsToBeBuilt = function(structureType, layout) {
    const rcl = this.controller.level;
    const allowsMultipleStructures = CONTROLLER_STRUCTURES[structureType][8] > 1;

    if (allowsMultipleStructures) {
        if (this[structureType].length >= CONTROLLER_STRUCTURES[structureType][rcl]) {
            return STATUS.ERR_ALREADY_AT_RCL_LIMIT;
        }
    } else {
        if (this[structureType] || CONTROLLER_STRUCTURES[structureType][rcl] === 0) {
            return STATUS.ERR_ALREADY_AT_RCL_LIMIT;
        }
    }

    if (layout.buildings[structureType]) {
        return this._placeConstructionSitesBasedOnLayout(structureType, layout);
    } else {
        return this._placeConstructionSitesBasedOnMagic(structureType, layout);
    }
};

Room.prototype._placeConstructionSitesBasedOnLayout = function(structureType, layout) {
    if (this[structureType].length >= layout.buildings[structureType].length) {
        return STATUS.ERR_ALREADY_AT_LAYOUT_LIMIT;
    }

    // TODO: Place stuff
};

Room.prototype._placeConstructionSitesBasedOnMagic = function(structureType, layout) {
    switch (structureType) {
        case STRUCTURE_RAMPART:
            return this._placeRamparts(layout);

        case STRUCTURE_WALL:
            // *shrugs* Who needs walls anyways?
            break;

        case STRUCTURE_EXTRACTOR:
            return this._placeExtractor();

        default:
            log.warning(this + structureType + " should be placed in layout but wasn't. Layout: " + layout.name);
            break;
    }
};

Room.prototype._placeRamparts = function(layout) {
    // TODO: RCL 2: Surround with 1 width rampart + controller
    // TODO: RCL 5: Surround with 2 width rampart (outer)
    // TODO: RCL 7: Surround with 3 width rampart (inner)

    // TODO: Store all rampart positions in memory, so this only needs to be called once
    // TODO:      ---> Memory layout: ramparts: {gcl2: [], gcl5: [], gcl7: []}
    // TODO: Flood-Fill from exits in order to check if a rampart is needed for each rcl stage, remove if not reached

    return STATUS.ERR_NOT_YET_IMPLEMENTED;
};

Room.prototype._placeExtractor = function() {
    if (!this.mineral) {
        log.warning(this + "wanted to place extractor but didn't find any mineral?!")
        return STATUS.ERR_UNDEFINED;
    }

    let result = this.createConstructionSite(this.mineral.pos, STRUCTURE_EXTRACTOR);
    if (result === OK) {
        return STATUS.SUCCESSFULLY_PLACED_CONSTRUCTION_SITE;
    } else {
        log.warning(this + "wanted to place extractor, but actually placing it returned " + result);
        return STATUS.ERR_UNDEFINED;
    }
};
