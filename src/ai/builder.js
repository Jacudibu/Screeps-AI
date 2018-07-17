const builder = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                this.collectEnergy(creep);
                break;
            case TASK.BUILD_STRUCTURE:
                this.buildStructures(creep);
                break;
            case TASK.REPAIR_STRUCTURE:
                this.repairStructures(creep);
                break;
            default:
                creep.memory.task = TASK.COLLECT_ENERGY;
                break;
        }
    },

    findClosestAvailableEnergyStorage: function (creep) {
        const storages = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN) && structure.energy >= creep.carryCapacity;
            }
        });

        if (storages.length === 0) {
            return undefined;
        }

        return _.sortBy(storages, s => creep.pos.getRangeTo(s))[0];
    },

    collectEnergy: function (creep) {
        let storage = this.findClosestAvailableEnergyStorage(creep);

        if (storage === undefined) {
            creep.say("No Energy");
            return;
        }

        switch (creep.withdraw(storage, RESOURCE_ENERGY)) {
            case OK:
                creep.memory.task = TASK.BUILD_STRUCTURE;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(storage);
                break;
            default:
                console.log("Collecting Energy resulted in unhandled error: " + creep.withdraw(storage, RESOURCE_ENERGY));
                break;
        }
    },

    buildStructures: function (creep) {
        let constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

        if (constructionSites.length === 0) {
            creep.say('No Build');
            creep.memory.task = TASK.REPAIR_STRUCTURE;
            return;
        }

        switch (creep.build(constructionSites[0])) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(constructionSites[0]);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.task = creep.COLLECT_ENERGY;
                break;
            default:
                console.log("unexpected error when building object: " + creep.build(constructionSites[0]));
                break;
        }
    },

    repairStructures: function (creep) {
        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax
        });

        damagedStructures.sort((a,b) => a.hits - b.hits);

        if(damagedStructures.length === 0) {
            creep.say("No Repairs");
            creep.memory.task = TASK.BUILD_STRUCTURE;
            return;
        }

        switch (creep.repair(damagedStructures[0])) {
            case OK:
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.task = TASK.COLLECT_ENERGY;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(damagedStructures[0]);
                break;
            default:
                console.log("unexpected error when repairing object: " + creep.repair(damagedStructures[0]));
                break;
        }
    },
};

module.exports = builder;