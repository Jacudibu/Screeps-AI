const requests = {};
Object.defineProperty(Room.prototype, "requestedCreeps", {
    get: function() {
        if (requests[this.name]) {
            return requests[this.name];
        }

        return this._recalculateRequestedCreeps();
    },

    set: function() {},
    configurable: false,
    enumerable: false,
});

Room.prototype._recalculateRequestedCreeps = function() {
    let requestedCreeps = {};

    switch(this.controller.level) {
        case 0:
            log.warning(this + "_recalculateRequestedCreeps called by RCL 0 room.");
            break;

        case 1:
            requestedCreeps[ROLE.EARLY_RCL_HARVESTER] = calculateAmountOfEarlyRCLHarvesters(this);
            if (requestedCreeps[ROLE.EARLY_RCL_HARVESTER] === undefined) {
                log.warning(this + "unable to calculate earlybirds on rcl 1, might be related to the very first tick of the game?");
                return;
            }

            requestedCreeps[ROLE.HARVESTER] = 0;
            requestedCreeps[ROLE.HAULER]    = 6;
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 2;
            break;

        case 2:
            requestedCreeps[ROLE.EARLY_RCL_HARVESTER] = calculateAmountOfEarlyRCLHarvesters(this);

            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2 + calculateDistanceFactor(this);
            requestedCreeps[ROLE.UPGRADER]  = 3;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 3;
            break;

        case 3:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2 + Math.floor((calculateDistanceFactor(this) * 0.50));
            requestedCreeps[ROLE.UPGRADER]  = 2;
            requestedCreeps[ROLE.BUILDER]   = 2;
            requestedCreeps[ROLE.REPAIRER]  = 2;
            break;

        case 4:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2 + Math.floor((calculateDistanceFactor(this) * 0.25));
            requestedCreeps[ROLE.UPGRADER]  = 2;
            requestedCreeps[ROLE.BUILDER]   = 2;
            requestedCreeps[ROLE.REPAIRER]  = 2;
            break;

        case 5:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2;
            requestedCreeps[ROLE.UPGRADER]  = 2;
            requestedCreeps[ROLE.BUILDER]   = 1;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        default:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2;
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 1;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;
    }

    return requests[this.name] = requestedCreeps;
};

const calculateAmountOfEarlyRCLHarvesters = function(room) {
    let freeSpaceAroundSources = 0;
    for (let source of room.sources) {
        freeSpaceAroundSources += source.freeTileCount;
    }

    return freeSpaceAroundSources + calculateDistanceFactor(room);
};

const calculateDistanceFactor = function(room) {
    let distanceFactor = 0;

    for (let source of room.sources) {
        distanceFactor += 1 + Math.floor(source.distanceToSpawn * 0.1);
    }

    return distanceFactor;
};