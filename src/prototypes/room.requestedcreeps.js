Room.prototype.updateRequestedCreeps = function() {
    let requestedCreeps = {};

    switch(this.controller.level) {
        case 1:
            let freeSpace = 0;
            for (let source of this.sources) {
                freeSpace += source.countFreeTilesAroundSource();
            }

            requestedCreeps[ROLE.EARLY_RCL_HARVESTER] = freeSpace * 2;
            requestedCreeps[ROLE.HARVESTER] = 0;
            requestedCreeps[ROLE.HAULER]    = 6;
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 2:
            requestedCreeps[ROLE.EARLY_RCL_HARVESTER] = freeSpace * 2;
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 6;
            requestedCreeps[ROLE.UPGRADER]  = 6;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 3:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 4;
            requestedCreeps[ROLE.UPGRADER]  = 3;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 4:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 3;
            requestedCreeps[ROLE.UPGRADER]  = 2;
            requestedCreeps[ROLE.BUILDER]   = 3;
            requestedCreeps[ROLE.REPAIRER]  = 1;
            break;

        case 5:
            requestedCreeps[ROLE.HARVESTER] = this.sources.length;
            requestedCreeps[ROLE.HAULER]    = 2;
            requestedCreeps[ROLE.UPGRADER]  = 1;
            requestedCreeps[ROLE.BUILDER]   = 2;
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