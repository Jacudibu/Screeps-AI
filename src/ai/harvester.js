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

    findClosestAvailableResource: function (creep) {
        let room = creep.room;
        this.initializeSourcesInRoom(room);

        return creep.pos.findClosestByPath(FIND_SOURCES, {filter: function(source) {
                return room.memory.sources[source.id].workers < room.memory.sources[source.id].max_workers;
            }});
    },

    initializeSourcesInRoom: function (room) {
        if (room.memory.sources == null) {
            room.memory.sources = {};
            for (let source of room.find(FIND_SOURCES)) {
                room.memory.sources[source.id] = {};
                room.memory.sources[source.id].workers = 0;
                room.memory.sources[source.id].max_workers = 3;
            }
        }
    },

    harvestEnergy: function (creep) {
        if (creep.memory.targetSourceId == null) {
            let targetSource = this.findClosestAvailableResource(creep);
            if (targetSource == null) {
                console.log("[harvester.energy] Warning: targetSource was null!");
                return;
            }

            creep.memory.targetSourceId = targetSource.id;
            creep.room.memory.sources[targetSource.id].workers++;
        }

        let targetSource = Game.getObjectById(creep.memory.targetSourceId);

        if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSource);
        }

        if (creep.carry.energy === creep.carryCapacity) {
            creep.room.memory.sources[creep.memory.targetSourceId].workers--;
            creep.memory.targetSourceId = null;
            creep.memory.task = TASK.STORE_ENERGY;
        }
    },

    storeEnergy: function (creep) {
        const structuresThatRequireEnergy = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });

        if (structuresThatRequireEnergy.length === 0) {
            creep.moveTo(Game.spawns.Spawn1.pos);
            creep.say('No Storage');
            return;
        }

        switch (creep.transfer(structuresThatRequireEnergy[0], RESOURCE_ENERGY)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(structuresThatRequireEnergy[0]);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.task = aiutils.setTaskRenewWhenNeededOr(creep, TASK.COLLECT_ENERGY);
                break;
            default:
                console.log("unexpected error when transferring energy: " + creep.transfer(structuresThatRequireEnergy[0], RESOURCE_ENERGY));
                break;
        }
    },
};

module.exports = harvester;