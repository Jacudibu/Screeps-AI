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
                creep.memory.task = TASK.BUILD_STRUCTURE;
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
            creep.say('No Energy :(')
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
                console.log('Collecting Energy resulted in unhandled error: ' + creep.withdraw(storage, RESOURCE_ENERGY));
                break;
        }
    },

    buildStructures: function (creep) {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length > 0) {
            if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else {
            creep.say('No Builderino');
            creep.memory.task = TASK.REPAIR_STRUCTURE;
        }

        this.checkEmptyEnergy(creep);
    },

    checkEmptyEnergy: function (creep) {
        if (creep.carry.energy === 0) {
            creep.memory.task = TASK.COLLECT_ENERGY;
        }
    }
};

module.exports = builder;