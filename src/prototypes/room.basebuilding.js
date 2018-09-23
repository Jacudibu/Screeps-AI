global.baseLayouts = {};
require('layouts.diamond14x14');

const RoadGenerator = require('basebuilding.roadgenerator');

const STRUCTURE_PRIORITY_ORDER = [
    // Essentials
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,

    // Nice To Have
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL,
    //STRUCTURE_CONTAINER, // spams warnings right now, so leave out until autoplacement works properly
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

// TODO: interrupt wait time on RCL Levelup
let nextConstructionTimer = {};
let allowConstructionSiteRequests = {};
const WAIT_TIME_WHEN_CONSTRUCTION_SITES_PRESENT = 25;
const WAIT_TIME_WHEN_EVERYTHING_IS_BUILT        = 5000;
const WAIT_TIME_WHEN_NO_LAYOUT_SETUP            = 50000;

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

const DEBUG = true;

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

Room.prototype.tryPlacingRemoteConstructionSites = function() {
    try {
        this._automaticallyPlaceRemoteConstructionSites();
    } catch (e) {
        let message = this + " construction site placement: " + e;
        if (e.stack) {
            message += "\nTrace:\n" + e.stack;
        }
        log.error(message);
    }
};

Room.prototype.requestNewConstructionSite = function() {
    if (allowConstructionSiteRequests[this.name]) {
        nextConstructionTimer[this.name] = 0;
        return true;
    }

    return false;
};

Room.prototype._forceConstructionUpdate = function() {
    nextConstructionTimer[this.name] = 0;
};

Room.prototype._automaticallyPlaceConstructionSites = function() {
    if (DEBUG) {
        this._debugExtraRoadPlacement();
    }

    if (nextConstructionTimer[this.name] && nextConstructionTimer[this.name] > Game.time) {
        return;
    }

    if (!this.memory.layout) {
        // Those rooms are manually built right now
        allowConstructionSiteRequests[this.name] = false;
        nextConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_NO_LAYOUT_SETUP);
        return;
    }

    const layout = baseLayouts.diamond14x14;

    if (this.controller.level === 1) {
        if (this.mySpawns.length > 0) {
            allowConstructionSiteRequests[this.name] = false;
            nextConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_EVERYTHING_IS_BUILT);
            return
        }
    }

    if (this.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        allowConstructionSiteRequests[this.name] = true;
        nextConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_CONSTRUCTION_SITES_PRESENT);
        return;
    }

    this._forceStructureUpdate();
    this._reloadFreeExtensionCache();

    const result = this._checkIfSomethingNeedsToBeBuilt(layout);
    switch (result) {
        case SUCCESSFULLY_PLACED:
            allowConstructionSiteRequests[this.name] = true;
            nextConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_CONSTRUCTION_SITES_PRESENT);
            break;

        case ERR_EVERYTHING_BUILT:
            allowConstructionSiteRequests[this.name] = false;
            nextConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_EVERYTHING_IS_BUILT);
            break;

        default:
            log.warning(this + "unhandled status in automatic construction site placement: " + result);
            break;
    }
};

Room.prototype._automaticallyPlaceRemoteConstructionSites = function() {
    if (DEBUG) {
        this._debugExtraRoadPlacement();
    }
};

Room.prototype._debugExtraRoadPlacement = function() {
    for (const category in this.memory.extraRoadPositions) {
        for (const roomPos of this.memory.extraRoadPositions[category]) {
            this.visual.circle(roomPos, {fill: "#00a0ff"});
        }
    }
};

Room.prototype._checkIfSomethingNeedsToBeBuilt = function(layout) {
    let result = ERR_UNDEFINED;
    for (let i = 0; i < STRUCTURE_PRIORITY_ORDER.length; i++) {
        result = this._checkIfStructureTypeNeedsToBeBuilt(STRUCTURE_PRIORITY_ORDER[i], layout);

        if (result === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    result = this._placeExtraRoads(layout);
    if (result === SUCCESSFULLY_PLACED) {
        return SUCCESSFULLY_PLACED;
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
    if (layout.buildings[structureType].pos.length > 1) {
        if (this[structureType].length >= layout.buildings[structureType].pos.length) {
            return ERR_ALREADY_AT_LAYOUT_LIMIT;
        }
    } else {
        if (this[structureType]) {
            return ERR_ALREADY_AT_LAYOUT_LIMIT;
        }
    }

    let center = this.memory.baseCenterPosition;
    if (!center) {
        const flags = this.find(FIND_FLAGS);
        for (const flag of flags) {
            if (flag.color === COLOR_YELLOW && flag.secondaryColor === COLOR_YELLOW) {
                this.memory.baseCenterPosition = { x: flag.pos.x, y: flag.pos.y };
                flag.remove();
            }
        }

        if (!this.memory.baseCenterPosition) {
            throw new Error("No center position set up for automated base building. You can place a Yellow/Yellow flag to set it up.");
        }
        center = this.memory.baseCenterPosition;
    }

    for (const position of layout.buildings[structureType].pos) {
        const result = this._placeConstructionSiteAtPosition(position.x + center.x, position.y + center.y, structureType);
        if (result === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    return ERR_UNDEFINED;
};

Room.prototype._placeConstructionSiteAtPosition = function(x, y, structureType) {
    const check = this._checkIfStructureTypeCouldBePlacedAt(x, y, structureType);
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

    const result = this.createConstructionSite(x, y, structureType);
    switch(result) {
        case OK:
            return SUCCESSFULLY_PLACED;
        case ERR_FULL:
            return ERR_CONSTRUCTION_SITE_LIMIT;
        case ERR_RCL_NOT_ENOUGH:
            return ERR_ALREADY_AT_RCL_LIMIT;
        default:
            log.warning(this + "unexpected error when placing construction site: " + result
                        + "\ndata: x: " + x + " | y: " + y + " structureType: " + structureType);
            return ERR_UNDEFINED;
    }
};

Room.prototype._checkIfStructureTypeCouldBePlacedAt = function(x, y, structureType) {
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
                        if (arrayElement.structure.structureType === structureType) {
                            return ERR_ALREADY_BUILT;
                        }
                        break;
                    case STRUCTURE_ROAD:
                        if (arrayElement.structure.structureType === structureType) {
                            return ERR_ALREADY_BUILT;
                        }
                        break;
                    default:
                        if (arrayElement.structure.structureType === structureType) {
                            return ERR_ALREADY_BUILT;
                        }

                        if (arrayElement.structure.structureType !== STRUCTURE_RAMPART || arrayElement.structure.structureType !== STRUCTURE_ROAD) {
                            return ERR_BLOCKED_BY_STRUCTURE;
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
    if (this.controller.level >= 2) {
        const result = this._placeRampartsAroundController();
        if (result === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    // TODO: RCL 2: Surround with 1 width rampart + controller
    // TODO: RCL 5: Surround with 2 width rampart (outer)
    // TODO: RCL 7: Surround with 3 width rampart (inner)

    // TODO: 1 Thickness Ramparts -> Flood fill -> remove unreached ramparts -> increase remaining rampart width to 3

    // TODO: Store all rampart positions in memory, so this only needs to be called once
    // TODO:      ---> Memory layout: ramparts: {gcl2: [], gcl5: [], gcl7: []}
    // TODO: Flood-Fill from exits in order to check if a rampart is needed for each rcl stage, remove if not reached

    return ERR_NOT_YET_IMPLEMENTED;
};

Room.prototype._placeRampartsAroundController = function() {
    // TODO: Cache in layout
    const controllerPos = this.controller.pos;

    const xArray = [controllerPos.x - 1, controllerPos.x, controllerPos.x + 1];
    const yArray = [controllerPos.y - 1, controllerPos.y, controllerPos.y + 1];
    for (let x of xArray) {
        for (let y of yArray) {
            if (Game.map.getTerrainAt(x, y, this.name) === 'wall') {
                continue;
            }

            const result = this._placeConstructionSiteAtPosition(x, y, STRUCTURE_RAMPART);
            if (result === SUCCESSFULLY_PLACED) {
                return SUCCESSFULLY_PLACED;
            }
        }
    }
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

Room.prototype._placeExtraRoads = function(layout) {
    const extraRoadPositions = RoadGenerator.generateAndGetRoads(this, layout);

    /*
    for (let i = 0; i < this.sources.length; i++) {
        if (this._placeExtraRoadsArray(extraRoadPositions['source' + i] ) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    if (this._placeExtraRoadsArray(extraRoadPositions.controller) === SUCCESSFULLY_PLACED) {
        return SUCCESSFULLY_PLACED;
    }

    if (this.controller.level > 6) {
        if (this._placeExtraRoadsArray(extraRoadPositions.mineral) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    */
    return ERR_UNDEFINED;
};

Room.prototype._placeExtraRoadsArray = function(roadPositions) {
    let result;
    for (let roadPos of roadPositions) {
        result = this._placeConstructionSiteAtPosition(roadPos.x, roadPos.y, STRUCTURE_ROAD);
        if (result === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }
};