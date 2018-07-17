const tasks = {
    HARVEST_ENERGY: 'harvest_energy',
    STORE_ENERGY: 'store_energy',
};

const harvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case tasks.HARVEST_ENERGY:
                this.harvestEnergy(creep);
                break;
            case tasks.STORE_ENERGY:
                this.storeEnergy(creep);
                break;
            default:
                creep.memory.task = tasks.HARVEST_ENERGY;
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
            creep.memory.task = tasks.STORE_ENERGY;
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

        this.checkEmptyEnergy(creep);
    },

    checkEmptyEnergy: function (creep) {
        if (creep.carry.energy === 0) {
            creep.memory.task = tasks.HARVEST_ENERGY;
        }
    }
};

module.exports = harvester;