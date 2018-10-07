const memoryManagment = {

    run() {
        this.deleteDeadCreeps();
        this.resetRoomCaches();
    },

    resetRoomCaches() {
        for (let roomName in Game.rooms) {
            Game.rooms[roomName]._emptyPublicEnergyContainers = undefined;
        }
    },

    deleteDeadCreeps() {
        for(let creepName in Memory.creeps) {
            if(Game.creeps[creepName]) {
                continue;
            }

            let creep = Memory.creeps[creepName];
            this.deleteRoleSpecificStuff(creep);

            utility.deleteRespawnTTLEntryOnDeath(creepName);
            utility.deleteSpawnRoomEntryOnDeath(creepName);
            delete Memory.creeps[creepName];
        }
    },

    deleteRoleSpecificStuff(creep) {
        switch (creep.role)
        {
            case ROLE.HARVESTER:
                if (creep.task === TASK.HARVEST_ENERGY) {
                    let source = Game.getObjectById(creep.taskTargetId);
                    if (source) {
                        source.memory.workersAssigned--;
                    }
                }
                break;

            case ROLE.REMOTE_WORKER:
                let keys = Object.keys(Memory.rooms[creep.targetRoomName].sources);
                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i] === creep.taskTargetId) {
                            Memory.rooms[creep.targetRoomName].sources[keys[i]].workersAssigned--;
                        }
                }
                break;

            case ROLE.REMOTE_HARVESTER:
                Memory.rooms[creep.targetRoomName].assignedHarvesters--;
                let keys2 = Object.keys(Memory.rooms[creep.targetRoomName].sources);
                for (let i = 0; i < keys2.length; i++) {
                    if (keys2[i] === creep.taskTargetId) {
                        Memory.rooms[creep.targetRoomName].sources[keys2[i]].workersAssigned--;
                    }
                }
                break;


            case ROLE.REMOTE_HAULER:
                Memory.rooms[creep.remoteHaulTargetRoom].assignedHaulers--;
                break;

            case ROLE.REMOTE_REPAIRER:
                if (creep.repairRouteIndex >= Memory.rooms[creep.spawnRoom].repairRoute.length) {
                    return;
                }

                let args = {
                    role: ROLE.REMOTE_REPAIRER,
                    repairRouteIndex: creep.repairRouteIndex,
                };
                Memory.rooms[creep.spawnRoom].spawnQueue.push(args);
                break;

            case ROLE.RESERVER:
                Memory.rooms[creep.targetRoomName].isReserverAssigned = false;
                break;

            case ROLE.MINERAL_HARVESTER:
                Memory.rooms[creep.spawnRoom].isMineralHarvesterAssigned = false;
                break;

            case ROLE.CLAIMER_ATTACKER:
                // TODO: This is basically just a lazy #HACK right now. REMOVE IT.
                const room = Game.rooms[creep.targetRoomName];
                if (room) {
                    if (room.controller && room.controller.level === 0) {
                        break;
                    }
                }

                let args2 = {
                    role: ROLE.CLAIMER_ATTACKER,
                    targetRoomName: creep.targetRoomName,
                };
                Memory.rooms[creep.spawnRoom].spawnQueue.push(args2);
                break;

            case ROLE.SCOUT:
                if (Game.rooms[creep.targetRoomName]) {
                    // creep got killed while switching rooms, a cruel act!
                    Game.rooms[creep.targetRoomName].updateScoutData();
                } else if (Memory.rooms[creep.targetRoomName]) {
                    delete Memory.rooms[creep.targetRoomName].isAlreadyScouted;
                }
                break;
        }
    },


};

profiler.registerObject(memoryManagment, "MemoryManagment");
module.exports = memoryManagment;