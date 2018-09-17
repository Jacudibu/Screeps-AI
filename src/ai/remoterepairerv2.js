const remoteRepairer = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.spawnRoom) {
                    creep.memory.targetRoomName = Memory.rooms[creep.memory.spawnRoom].repairRoute[creep.memory.repairRouteIndex];

                    if (_.sum(creep.carry) < creep.carryCapacity) {
                        creep.setTask(TASK.COLLECT_ENERGY);
                    } else {
                        creep.setTask(TASK.MOVE_TO_ROOM);
                    }
                    return;
                }

                if (creep.room.name !== creep.memory.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                    return;
                }

                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    let damagedStructure = creep._getDamagedStructure(0.9, true);
                    if (damagedStructure === ERR_NOT_FOUND) {
                        let constructionSite = creep._getConstructionSite();
                        if (constructionSite === ERR_NOT_FOUND) {
                            const nextRoomIndex = ++creep.memory.repairRouteIndex;
                            const repairRoute = Memory.rooms[creep.memory.spawnRoom].repairRoute;

                            if (nextRoomIndex >= repairRoute.length) {
                                creep.suicide();
                                return;
                            }

                            creep.memory.targetRoomName = repairRoute[nextRoomIndex];
                            creep.setTask(TASK.MOVE_TO_ROOM);
                            return;
                        } else {
                            creep.memory.task = TASK.BUILD_STRUCTURE;
                            return;
                        }
                    } else {
                        creep.memory.task = TASK.REPAIR_STRUCTURE;
                        return;
                    }
                }

                creep.setTask(TASK.HAUL_ENERGY);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.HAUL_ENERGY:
                let result = creep.haulEnergy(TASK.DECIDE_WHAT_TO_DO);
                if (result === ERR_NOT_FOUND) {
                    // Goto spawn room and collect energy there
                    creep.memory.targetRoomName = this.memory.spawnRoom;
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }
                break;

            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.DECIDE_WHAT_TO_DO, TASK.HAUL_ENERGY, 0.9, true);
                break;

            case TASK.BUILD_STRUCTURE:
                creep.buildStructures(TASK.DECIDE_WHAT_TO_DO, TASK.HAUL_ENERGY);
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = remoteRepairer;