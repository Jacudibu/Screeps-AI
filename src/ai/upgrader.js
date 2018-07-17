const upgrader = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                this.collectEnergy(creep);
                break;
            case TASK.UPGRADE_CONTROLLER:
                this.upgradeController(creep);
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
            return;
        }

        switch (creep.withdraw(storage, RESOURCE_ENERGY)) {
            case OK:
                creep.memory.task = TASK.UPGRADE_CONTROLLER;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(storage);
                break;
            case ERR_FULL:
                creep.memory.task = TASK.UPGRADE_CONTROLLER;
                break;
            default:
                console.log('Collecting Energy resulted in unhandled error: ' + creep.withdraw(storage, RESOURCE_ENERGY));
                break;
        }
    },

    upgradeController: function(creep) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }

        this.checkWetherEnergyShouldBeCollected(creep);
    },

    checkWetherEnergyShouldBeCollected: function (creep) {
        if (creep.carry.energy === 0) {
            creep.memory.task = TASK.COLLECT_ENERGY;
        }
    }
};

module.exports = upgrader;