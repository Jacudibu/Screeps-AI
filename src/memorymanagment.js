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

            utility.deleteCreepCacheOnDeath(creepName);
            delete Memory.creeps[creepName];
        }
    },

    deleteRoleSpecificStuff(creep) {
        switch (creep.role)
        {
            case ROLE.HARVESTER:
                utility.reduceSourceWorkerAssignedCount(creep.taskTargetId);
                break;

            case ROLE.HAULER:
                if (creep.task === TASK.STORE_ENERGY) {
                    Game.rooms[creep.spawnRoom]._reloadFreeExtensionCache();
                }
                break;

            case ROLE.REMOTE_HARVESTER:
                Memory.rooms[creep.targetRoomName].assignedHarvesters--;
                utility.reduceSourceWorkerAssignedCount(creep.taskTargetId);
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
                break;

            case ROLE.SCOUT:
            case ROLE.SCOUT_WITH_ATTACK_PART:
                if (Game.rooms[creep.targetRoomName]) {
                    // creep got killed while switching rooms, a cruel act!
                    Game.rooms[creep.targetRoomName].updateScoutData();
                } else if (Memory.rooms[creep.targetRoomName]) {
                    delete Memory.rooms[creep.targetRoomName].isAlreadyScouted;
                }
                break;
            case ROLE.DEFENDER:
            case ROLE.RANGED_DEFENDER:
                if (roomThreats[creep.targetRoomName]) {
                    Memory.rooms[creep.targetRoomName].requiresHelp = true;
                }
                break;
        }
    },


};

profiler.registerObject(memoryManagment, "MemoryManagment");
module.exports = memoryManagment;