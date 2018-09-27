Room.prototype.updateRequestedCreeps = function() {
    let requestedCreeps = {};

    switch(this.controller.level) {
        case 1:
            requestedCreeps[ROLE.EARLY_RCL_HARVESTER] = calculateAmountOfEarlyRCLHarvesters(this);
            requestedCreeps[ROLE.HARVESTER] = 0;
            requestedCreeps[ROLE.HAULER]    = 6;
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 2:
            requestedCreeps[ROLE.EARLY_RCL_HARVESTER] = calculateAmountOfEarlyRCLHarvesters(this);
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2 + calculateDistanceFactor(this);
            requestedCreeps[ROLE.UPGRADER]  = 6;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 3:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2 + Math.floor((calculateDistanceFactor(this) * 0.66));
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 2;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 4:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2 + Math.floor((calculateDistanceFactor(this) * 0.33));
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 2;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 5:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2;
            requestedCreeps[ROLE.UPGRADER]  = 1;
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

    this.memory.requestedCreeps = requestedCreeps;
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