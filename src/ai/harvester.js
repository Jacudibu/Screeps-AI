const harvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_ENERGY:
                this.harvestEnergy(creep);
                break;
            case TASK.STORE_ENERGY:
                this.storeEnergy(creep);
                break;
            case TASK.RENEW:
                this.renew(creep);
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
                console.log("[worker.harvest] Warning: targetSource was null!");
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
        const targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
        if (targets.length > 0) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
        else {
            creep.moveTo(Game.spawns.Spawn1.pos);
            creep.say('All full!');
        }

        if (this.checkEmptyEnergy(creep)) {
            this.checkLifetime(creep);
        }
    },

    renew: function (creep) {
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
                creep.memory.task = TASK.HARVEST_ENERGY;
                console.log("renew of creep complete!" + creep);
                break;
            default:
                console.log("unexpected error when renewing creep: " + spawn.renewCreep(creep));
        }
    },

    checkEmptyEnergy: function (creep) {
        if (creep.carry.energy === 0) {
            creep.memory.task = TASK.HARVEST_ENERGY;
            return true;
        }

        return false;
    },

    checkLifetime: function (creep) {
        if (creep.ticksToLive < 250) {
            creep.memory.task = TASK.RENEW;
        }
    },
};

module.exports = harvester;