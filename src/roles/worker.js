const jobs = require('roles_jobs');

const worker = {

    run: function (creep) {
        switch (creep.memory.job) {
            case jobs.IDLE:
                creep.memory.job = jobs.HARVEST_ENERGY;
                break;
            case jobs.HARVEST_ENERGY:
                this.harvestEnergy(creep);
                break;
            case jobs.STORE_ENERGY:
                this.storeEnergy(creep);
                break;
            case jobs.BUILD_STRUCTURE:
                this.buildStructures(creep);
                break;
            case jobs.UPGRADE_CONTROLLER:
                this.upgradeController(creep);
                break;
            default:
                creep.say("BEEEEP~~~");
                break;
        }
    },

    getWorkerJob: function (creep) {
        let room = creep.room;

        if (creep.memory.priority === jobs.STORE_ENERGY) {
            if (room.energyAvailable < room.energyCapacityAvailable) {
                return jobs.STORE_ENERGY;
            } else {
                return jobs.BUILD_STRUCTURE;
            }
        }

        return creep.memory.priority;
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
                room.memory.sources[source.id].max_workers = 4;
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
            creep.memory.job = this.getWorkerJob(creep);
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
            creep.memory.job = jobs.BUILD_STRUCTURE;
        }

        this.checkEmptyEnergy(creep);
    },

    upgradeController: function(creep) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }

        this.checkEmptyEnergy(creep);
    },

    buildStructures: function (creep) {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length > 0) {
            if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else {
            creep.say('No Builderino');
            creep.memory.job = jobs.STORE_ENERGY;
        }

        this.checkEmptyEnergy(creep);
    },

    checkEmptyEnergy: function (creep) {
        if (creep.carry.energy === 0) {
            creep.memory.job = jobs.IDLE;
        }
    }
};

module.exports = worker;