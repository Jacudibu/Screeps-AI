global.baseLayouts = {};
require('layouts.diamond14x14');

const STRUCTURE_PRIORITY_ORDER = [
    // Essentials
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,

    // Nice To Have
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_RAMPART,
    STRUCTURE_LINK,
    STRUCTURE_LAB,
    STRUCTURE_ROAD,
    STRUCTURE_WALL,

    // Fluff
    STRUCTURE_OBSERVER,
    STRUCTURE_NUKER,
    STRUCTURE_POWER_SPAWN,
];

const SUCCESSFULLY_PLACED           = 1;
const ERR_ALREADY_AT_RCL_LIMIT      = 2;
const ERR_ALREADY_AT_LAYOUT_LIMIT   = 3;
const ERR_NO_SUITABLE_SITES_FOUND   = 4;
const ERR_EVERYTHING_BUILT          = 5;
const ERR_CONSTRUCTION_SITE_LIMIT   = 6;

const VALID_CONSTRUCTION_SITE       = 1;
const ERR_ALREADY_BUILT             = 2;
const ERR_BLOCKED_BY_CREEP          = 3;
const ERR_BLOCKED_BY_STRUCTURE      = 4;
const ERR_BLOCKED_BY_TERRAIN_WALL   = 5;

const ERR_NOT_YET_IMPLEMENTED       = 42;
const ERR_UNDEFINED                 = 999;

Room.prototype.tryPlacingConstructionSites = function() {
    try {
        this._automaticallyPlaceConstructionSites();
    } catch (e) {
        let message = this + " construction site placement: " + e;
        if (e.stack) {
            message += "\nTrace:\n" + e.stack;
        }
        log.error(message);
    }
};

Room.prototype._automaticallyPlaceConstructionSites = function() {
    const layout = this.memory.layout;
    if (!layout) {
        // TODO: Wait for a long, long time before checking again
        // Those rooms are manually built right now
        return;
    }

    if (this.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        // TODO: Wait 25 Ticks.
        return;
    }

    const result = this._checkIfSomethingNeedsToBeBuilt(layout);
    switch (result) {
        case SUCCESSFULLY_PLACED:
            // TODO: wait 25 Ticks
            break;

        case ERR_EVERYTHING_BUILT:
            // TODO: wait ... 5000-ish ticks.
            // TODO: interrupt wait time on RCL Levelup
            break;

        default:
            // TODO: ... not sure?
            log.warning(this + "unhandled status in automatic construction site placement: " + result);
            break;
    }
};

Room.prototype._checkIfSomethingNeedsToBeBuilt = function(layout) {
    let result = ERR_UNDEFINED;
    for (let i = 0; i < STRUCTURE_PRIORITY_ORDER.length; i++) {
        result = this._checkIfStructureTypeNeedsToBeBuilt(STRUCTURE_PRIORITY_ORDER[i], layout);

        if (result === SUCCESSFULLY_PLACED) {
            return result;
        }
    }

    return ERR_EVERYTHING_BUILT;
};

Room.prototype._checkIfStructureTypeNeedsToBeBuilt = function(structureType, layout) {
    const rcl = this.controller.level;
    const allowsMultipleStructures = CONTROLLER_STRUCTURES[structureType][8] > 1;

    if (allowsMultipleStructures) {
        if (this[structureType].length >= CONTROLLER_STRUCTURES[structureType][rcl]) {
            return ERR_ALREADY_AT_RCL_LIMIT;
        }
    } else {
        if (this[structureType] || CONTROLLER_STRUCTURES[structureType][rcl] === 0) {
            return ERR_ALREADY_AT_RCL_LIMIT;
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
        return ERR_ALREADY_AT_LAYOUT_LIMIT;
    }

    const center = this.memory.baseCenterPosition;
    if (!center) {
        throw new Error("No center position set up for automated base building");
    }

    for (const position of layout.buildings[structureType].pos) {
        const result = this._placeConstructionSiteAtPosition(structureType, position.x + center.x, position.y + center.y);
        if (result === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    return ERR_UNDEFINED;
};

Room.prototype._placeConstructionSiteAtPosition = function(structureType, x, y) {
    const check = this._checkIfStructureTypeCouldBePlacedAt(structureType, x, y);
    switch (check) {
        case VALID_CONSTRUCTION_SITE:
            break;

        case ERR_ALREADY_BUILT:
        case ERR_BLOCKED_BY_CREEP:
        case ERR_BLOCKED_BY_STRUCTURE:
        case ERR_BLOCKED_BY_TERRAIN_WALL:
            return check;

        default:
            log.warning(this + "unexpected check result when placing construction site: " + check);
            return ERR_UNDEFINED;
    }

    const result = this.createConstructionSite(structureType, x, y);
    switch(result) {
        case OK:
            return SUCCESSFULLY_PLACED;

        default:
            log.warning(this + "unexpected error when placing construction site: " + result);
            return ERR_UNDEFINED;
    }
};

Room.prototype._checkIfStructureTypeCouldBePlacedAt = function(structureType, x, y) {
    const stuffAtPos = this.lookAt(x, y);

    for (const arrayElement of stuffAtPos) {
        switch (arrayElement.type) {
            case 'creep':
                return ERR_BLOCKED_BY_CREEP;
            case 'terrain':
                if (arrayElement.terrain === 'wall') {
                    return ERR_BLOCKED_BY_TERRAIN_WALL;
                }
                break;
            case 'structure':
                switch (structureType) {
                    case STRUCTURE_RAMPART:
                        for (const structure of arrayElement.structures) {
                            if (structure.structureType === structureType) {
                                return ERR_ALREADY_BUILT;
                            }
                        }
                        break;
                    case STRUCTURE_ROAD:
                        for (const structure of arrayElement.structures) {
                            if (structure.structureType === structureType) {
                                return ERR_ALREADY_BUILT;
                            }
                        }
                        break;
                    default:
                        for (const structure of arrayElement.structures) {
                            if (structure.structureType === structureType) {
                                return ERR_ALREADY_BUILT;
                            }

                            if (structure.structureType !== STRUCTURE_RAMPART || structure.structureType !== STRUCTURE_ROAD) {
                                return ERR_BLOCKED_BY_STRUCTURE;
                            }
                        }
                        break;
                }
        }
    }

    return VALID_CONSTRUCTION_SITE;
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

    return ERR_NOT_YET_IMPLEMENTED;
};

Room.prototype._placeExtractor = function() {
    if (!this.mineral) {
        log.warning(this + "wanted to place extractor but didn't find any mineral?!");
        return ERR_UNDEFINED;
    }

    let result = this.createConstructionSite(this.mineral.pos, STRUCTURE_EXTRACTOR);
    if (result === OK) {
        return SUCCESSFULLY_PLACED;
    } else {
        log.warning(this + "wanted to place extractor, but actually placing it returned " + result);
        return ERR_UNDEFINED;
    }
};
