global.baseLayouts = {};
const layoutMagic = require('layouts.layouts');

const roadGenerator = require('basebuilding.roadgenerator');
const rampartGenerator = require('basebuilding.rampartgenerator');

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

let nextRemoteConstructionTimer = {};
let allowRemoteConstructionSiteRequests = {};

let phase = {};
const WAIT_TIME_WHEN_CONSTRUCTION_SITES_PRESENT =    25;
const WAIT_TIME_WHEN_EVERYTHING_IS_BUILT        =  5000;
const WAIT_TIME_WHEN_EVERYTHING_IS_BUILT_REMOTE = 10000;
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
    if (this.controller && this.controller.my) {
        if (allowConstructionSiteRequests[this.name]) {
            nextConstructionTimer[this.name] = 0;

            return phase[this.name] !== STRUCTURE_RAMPART;
        }
    } else {
        if (allowRemoteConstructionSiteRequests[this.name]) {
            nextRemoteConstructionTimer[this.name] = 0;
            return this._automaticallyPlaceRemoteConstructionSites() === SUCCESSFULLY_PLACED;
        }
    }

    return false;
};

Room.prototype._forceConstructionUpdate = function() {
    nextConstructionTimer[this.name] = 0;
};

Room.prototype._automaticallyPlaceConstructionSites = function() {
    if (DEBUG && this.memory.layout) {
        this._debugRoadPlacement(this.memory.layout);
        this._debugRampartPlacement();
    }

    if (nextConstructionTimer[this.name] && nextConstructionTimer[this.name] > Game.time) {
        return;
    }

    if (!this.memory.layout && !this.memory.predefinedLayoutName) {
        // Those rooms are manually built right now
        allowConstructionSiteRequests[this.name] = false;
        nextConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_NO_LAYOUT_SETUP);
        return;
    }

    let layout;
    if (this.memory.layout) {
        layout = this.memory.layout;
    } else {
        const centerPosition = this._getCenterPosition();
        layout = layoutMagic.offsetLayout(baseLayouts[this.memory.predefinedLayoutName], centerPosition.x, centerPosition.y);
        this.memory.layout = layout;
    }

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
    if (DEBUG && this.memory.layout) {
        this._debugRoadPlacement();
    }

    if (nextRemoteConstructionTimer[this.name] && nextRemoteConstructionTimer[this.name] > Game.time) {
        return;
    }

    if (!this.memory.layout) {
        // Those rooms are manually built right now
        allowRemoteConstructionSiteRequests[this.name] = false;
        nextRemoteConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_NO_LAYOUT_SETUP);
        return;
    }

    if (this.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        allowRemoteConstructionSiteRequests[this.name] = true;
        nextRemoteConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_CONSTRUCTION_SITES_PRESENT);
        return;
    }

    this._forceStructureUpdate();

    const remoteRoads = this.memory.layout.roads;
    for (const remoteName in remoteRoads) {
        if (this._placeExtraRoadsArray(remoteRoads[remoteName]) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    nextRemoteConstructionTimer[this.name] = utility.getFutureGameTimeWithRandomOffset(WAIT_TIME_WHEN_EVERYTHING_IS_BUILT_REMOTE);
    return ERR_EVERYTHING_BUILT;
};

Room.prototype._debugRoadPlacement = function(layout) {
    if (this.controller && this.controller.my) {
        // Just making sure it exists...
        roadGenerator.generateAndGetRoads(this, layout);

        if (layout) {
            for (let pos of layout.buildings.road.pos) {
                this.visual.circle(new RoomPosition(pos.x, pos.y, this.name), {fill: "#00a0ff", opacity: 0.25});
            }
        }
    }

    for (const category in this.memory.layout.roads) {
        for (const roomPos of this.memory.layout.roads[category]) {
            this.visual.circle(roomPos, {fill: "#00a0ff", opacity: 0.25});
        }
    }
};

Room.prototype._debugRampartPlacement = function() {
    let ramparts = this.memory.layout.ramparts;
    if (!ramparts) {
        ramparts = rampartGenerator.calculateRampartPositions(this, this.memory.layout);
    }

    for (let pos of ramparts.center) {
        this.visual.circle(pos.x, pos.y, {fill: "#009900"});
    }

    for (let pos of ramparts.inner) {
        this.visual.circle(pos.x, pos.y, {fill: "#00bb00"});
    }

    for (let pos of ramparts.outer) {
        this.visual.circle(pos.x, pos.y, {fill: "#007700"});
    }

    for (let pos of ramparts.controller) {
        this.visual.circle(pos.x, pos.y, {fill: "#009900"});
    }
};

Room.prototype.forceRampartRegeneration = function() {
    rampartGenerator.calculateRampartPositions(this, this.memory.layout);
};

Room.prototype.forceRoadRegeneration = function() {
    roadGenerator.generateAndGetRoads(this, this.memory.layout, true);
};

Room.prototype.forceRemoteRoadRegeneration = function(baseRoomName) {
    roadGenerator.generateRoadsForRemoteRoom(Game.rooms[baseRoomName], Memory.rooms[baseRoomName].layout, this);
};

Room.prototype._getCenterPosition = function() {
    let center = this.memory.baseCenterPosition;
    if (!center) {
        const flags = this.find(FIND_FLAGS);
        for (const flag of flags) {
            if (flag.color === COLOR_YELLOW && flag.secondaryColor === COLOR_YELLOW) {
                center = { x: flag.pos.x, y: flag.pos.y };
                flag.remove();
            }
        }

        if (!center) {
            throw new Error("No center position set up for automated base building. You can place a Yellow/Yellow flag to set it up.");
        }
        this.memory.baseCenterPosition = center;
    }

    return new RoomPosition(center.x, center.y, this.name);
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

    phase[this.name] = "DONE";
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

    phase[this.name] = structureType;
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

    for (const position of layout.buildings[structureType].pos) {
        const result = this._placeConstructionSiteAtPosition(position.x, position.y, structureType);
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
            //case 'creep':
            //    return ERR_BLOCKED_BY_CREEP;
            case 'terrain':
                // noinspection JSUnresolvedVariable
                if (arrayElement.terrain === 'wall') {
                    return ERR_BLOCKED_BY_TERRAIN_WALL;
                }
                break;
            case 'structure':
                switch (structureType) {
                    case STRUCTURE_RAMPART:
                        // noinspection JSUnresolvedVariable
                        if (arrayElement.structure.structureType === structureType) {
                            return ERR_ALREADY_BUILT;
                        }
                        break;
                    case STRUCTURE_ROAD:
                        // noinspection JSUnresolvedVariable
                        if (arrayElement.structure.structureType === structureType) {
                            return ERR_ALREADY_BUILT;
                        }
                        break;
                    default:
                        // noinspection JSUnresolvedVariable
                        if (arrayElement.structure.structureType === structureType) {
                            return ERR_ALREADY_BUILT;
                        }

                        // noinspection JSUnresolvedVariable
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
            return ERR_EVERYTHING_BUILT; //this._placeRamparts(layout);

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
    let ramparts = rampartGenerator.generateAndGetRamparts(this, layout);

    if (this.controller.level >= 2) {
        if (this._placeRampartArray(ramparts.center) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }

        if (this._placeRampartArray(ramparts.controller) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    if (this.controller.level >= 5) {
        if (this._placeRampartArray(ramparts.outer) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    if (this.controller.level >= 7) {
        if (this._placeRampartArray(ramparts.inner) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    return ERR_EVERYTHING_BUILT;
};

Room.prototype._placeRampartArray = function(array) {
    for (let pos of array) {
        const result = this._placeConstructionSiteAtPosition(pos.x, pos.y, STRUCTURE_RAMPART);
        if (result === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }
    return ERR_EVERYTHING_BUILT;
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
    const extraRoadPositions = roadGenerator.generateAndGetRoads(this, layout);

    for (let i = 0; i < this.sources.length; i++) {
        if (this._placeExtraRoadsArray(extraRoadPositions['source' + i] ) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    if (this._placeExtraRoadsArray(extraRoadPositions.controller) === SUCCESSFULLY_PLACED) {
        return SUCCESSFULLY_PLACED;
    }

    if (this.controller.level >= 6) {
        if (this._placeExtraRoadsArray(extraRoadPositions.mineral) === SUCCESSFULLY_PLACED) {
            return SUCCESSFULLY_PLACED;
        }
    }

    if (this.remotes) {
        for (const remoteName of this.remotes) {
            if (extraRoadPositions[remoteName]) {
                if (this._placeExtraRoadsArray(extraRoadPositions[remoteName]) === SUCCESSFULLY_PLACED) {
                    return SUCCESSFULLY_PLACED;
                }
            }
        }
    }

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

    return ERR_UNDEFINED;
};