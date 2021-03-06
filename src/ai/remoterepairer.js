const ai = {
    run(creep) {
        if (creep.task !== TASK.MOVE_TO_ROOM && creep.fleeFromNearbyEnemies(true) !== ERR_NOT_FOUND) {
            return;
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                decideWhatToDo(creep);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.HAUL_ENERGY:
                let result = creep.haulEnergy(TASK.DECIDE_WHAT_TO_DO);
                if (result === ERR_NOT_FOUND && creep.carry[RESOURCE_ENERGY] === 0) {
                    // Goto spawn room and collect energy there
                    creep.targetRoomName = creep.spawnRoom;
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

            case TASK.DISMANTLE:
                creep.dismantleStructure(TASK.DECIDE_WHAT_TO_DO);
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    },
};

const decideWhatToDo = function(creep) {
    if (creep.room.name === creep.spawnRoom) {
        creep.targetRoomName = Memory.rooms[creep.spawnRoom].repairRoute[creep.memory.repairRouteIndex];

        if (_.sum(creep.carry) < creep.carryCapacity) {
            creep.setTask(TASK.COLLECT_ENERGY);
        } else {
            creep.setTask(TASK.MOVE_TO_ROOM);
        }
        return;
    }

    if (creep.room.name !== creep.targetRoomName) {
        creep.setTask(TASK.MOVE_TO_ROOM);
        return;
    }

    if (creep.carry[RESOURCE_ENERGY] > 0) {
        let damagedStructure = creep._getDamagedStructure(0.9, true);
        if (damagedStructure === ERR_NOT_FOUND) {
            let constructionSite = creep._getConstructionSite();
            if (constructionSite === ERR_NOT_FOUND) {
                if (creep.dismantleStructure() !== ERR_NOT_FOUND) {
                    creep.task = TASK.DISMANTLE;
                    return;
                }

                const nextRoomIndex = ++creep.memory.repairRouteIndex;
                const repairRoute = Memory.rooms[creep.spawnRoom].repairRoute;

                if (nextRoomIndex >= repairRoute.length) {
                    creep.suicide();
                    return;
                }

                creep.targetRoomName = repairRoute[nextRoomIndex];
                creep.setTask(TASK.MOVE_TO_ROOM);
                return;
            }
            creep.task = TASK.BUILD_STRUCTURE;
            return;
        } else {
            creep.task = TASK.REPAIR_STRUCTURE;
            return;
        }
    }

    if (creep.dismantleStructure() !== ERR_NOT_FOUND) {
        creep.task = TASK.DISMANTLE;
    } else {
        creep.setTask(TASK.HAUL_ENERGY);
    }
};

module.exports = ai;