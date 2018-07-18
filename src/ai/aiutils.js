const aiutils = {
    setTaskRenewWhenNeededOr(creep, alternativeTask) {
        if (creep.memory.shouldRespawn && creep.ticksToLive < CRITICAL_TICKS_TO_LIVE_VALUE) {
            if (creep.memory.tier >= Math.floor(creep.room.energyCapacityAvailable / COST_PER_WORKER_TIER)) {
                creep.memory.task = TASK.RENEW_CREEP;
            }
        } else {
            creep.memory.task = alternativeTask;
        }
    },

    doesStructureStoreEnergy: function (structure) {
        return structure.structureType === STRUCTURE_EXTENSION
            || structure.structureType === STRUCTURE_SPAWN
            || structure.structureType === STRUCTURE_CONTAINER
            || structure.structureType === STRUCTURE_STORAGE;
    },

    findClosesFilledEnergyStorage: function (creep) {
        const storages = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return this.doesStructureStoreEnergy(structure) && structure.energy >= creep.carryCapacity;
            }
        });

        if (storages.length === 0) {
            return undefined;
        }

        return _.sortBy(storages, s => creep.pos.getRangeTo(s))[0];
    },

    findClosestFreeEnergyStorage: function (creep) {
        const structuresThatRequireEnergy = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return this.doesStructureStoreEnergy(structure) && structure.energy < structure.energyCapacity;
            }
        });

        if (structuresThatRequireEnergy.length === 0) {
            return undefined;
        }

        return _.sortBy(structuresThatRequireEnergy, s => creep.pos.getRangeTo(s))[0];
    },

    collectEnergy: function (creep, taskWhenFinished) {
        if (creep.room.energyCapacityAvailable - creep.room.energyAvailable > creep.carryCapacity + ENERGY_COLLECTOR_EXTRA_BUFFER) {
            creep.say("Buffering");
            return;
        }

        if (!creep.room.memory.allowEnergyCollection) {
            creep.say("Forbidden");
            return;
        }

        let storage = this.findClosesFilledEnergyStorage(creep);

        if (storage === undefined) {
            creep.say("No Energy");
            return;
        }

        switch (creep.withdraw(storage, RESOURCE_ENERGY)) {
            case OK:
                creep.memory.task = taskWhenFinished;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(storage);
                break;
            default:
                console.log("Collecting Energy resulted in unhandled error: " + creep.withdraw(storage, RESOURCE_ENERGY));
                break;
        }
    },

    renewCreep: function (creep, taskWhenFinished) {
        let spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);

        switch (spawn.renewCreep(creep)) {
            case OK:
                break;
            case ERR_BUSY:
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(spawn);
                break;
            case ERR_FULL:
                creep.memory.task = taskWhenFinished;
                break;
            default:
                console.log("unexpected error when renewing creep: " + spawn.renewCreep(creep));
        }
    },
};

module.exports = aiutils;