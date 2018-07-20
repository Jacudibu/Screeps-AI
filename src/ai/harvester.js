const aiutils = require('ai_aiutils');

const harvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_ENERGY:
                this.harvestEnergy(creep);
                break;
            case TASK.STORE_ENERGY:
                this.storeEnergy(creep);
                break;
            case TASK.RENEW_CREEP:
                aiutils.renewCreep(creep, TASK.HARVEST_ENERGY);
                break;
            default:
                creep.setTask(TASK.HARVEST_ENERGY);
                break;
        }
    },

    findClosestAvailableResource: function (creep) {
        return creep.pos.findClosestByPath(FIND_SOURCES, {filter: function(source) {
                return source.memory.workersAssigned < source.memory.workersMax;
            }});
    },

    getSource: function(creep) {
        if (creep.memory.taskTargetId) {
            return Game.getObjectById(creep.memory.taskTargetId);
        }

        let source = this.findClosestAvailableResource(creep);

        if (source == null)  {
            return ERR_NOT_FOUND;
        }

        source.memory.workersAssigned++;
        creep.memory.taskTargetId = source.id;
        return source;
    },

    harvestEnergy: function (creep) {
        let source = this.getSource(creep);

        if (source === ERR_NOT_FOUND) {
            creep.say("NO SOURCE");
            return;
        }

        switch (creep.harvest(source)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source);
                break;
            default:
                console.log("unexpected error when harvesting energy: " + creep.harvest(source) + " --> " + source);
                break;
        }

        if (creep.carry.energy === creep.carryCapacity) {
            source.memory.workersAssigned--;
            creep.setTask(TASK.STORE_ENERGY);
        }
    },

    getStorage: function(creep) {
        if (creep.memory.taskTargetId) {
            return Game.getObjectById(creep.memory.taskTargetId);
        }

        const structureThatRequiresEnergy = aiutils.findClosestFreeEnergyStorage(creep);

        if (structureThatRequiresEnergy === undefined) {
            return ERR_NOT_FOUND;
        }

        creep.memory.taskTargetId = structureThatRequiresEnergy.id;
        return structureThatRequiresEnergy;
    },

    storeEnergy: function (creep) {
        const structureThatRequiresEnergy = this.getStorage(creep);

        if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
            creep.say('No Storage');
            return;
        }

        switch (creep.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(structureThatRequiresEnergy);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.setTask(creep.isRenewNeeded() ? TASK.RENEW_CREEP : TASK.COLLECT_ENERGY);
                break;
            case ERR_FULL:
                creep.resetCurrentTask();
                break;
            default:
                console.log("unexpected error when transferring energy: " + creep.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY));
                break;
        }
    },
};

module.exports = harvester;