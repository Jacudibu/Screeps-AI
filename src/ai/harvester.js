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
                creep.memory.task = TASK.HARVEST_ENERGY;
                break;
        }
    },

    initializeSourcesInRoom: function (room) {
        if (room.memory.sources == null) {
            room.memory.sources = {};
            for (let source of room.find(FIND_SOURCES)) {
                room.memory.sources[source.id] = {};
                room.memory.sources[source.id].assignedWorkers = 0;
                room.memory.sources[source.id].max_workers = 3;
            }
        }
    },

    findClosestAvailableResource: function (creep) {
        let room = creep.room;
        this.initializeSourcesInRoom(room);

        return creep.pos.findClosestByPath(FIND_SOURCES, {filter: function(source) {
                return room.memory.sources[source.id].assignedWorkers < room.memory.sources[source.id].max_workers;
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

        source.room.memory.sources[source.id].assignedWorkers++;
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
            creep.room.memory.sources[creep.memory.taskTargetId].assignedWorkers--;
            creep.memory.taskTargetId = undefined;
            creep.memory.task = TASK.STORE_ENERGY;
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
                creep.memory.taskTargetId = undefined;
                creep.memory.task = aiutils.setTaskRenewWhenNeededOr(creep, TASK.COLLECT_ENERGY);
                break;
            case ERR_FULL:
                creep.memory.taskTargetId = undefined;
                break;
            default:
                console.log("unexpected error when transferring energy: " + creep.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY));
                break;
        }
    },
};

module.exports = harvester;