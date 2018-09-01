const remoteRepairer = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.memory.targetRoomName) {
                    if (_.sum(creep.carry) < creep.carryCapacity) {
                        let spawns = creep.room.find(FIND_MY_SPAWNS);
                        if (spawns.length > 0) {
                            creep.setTask(TASK.COLLECT_ENERGY);
                            return;
                        }
                    }

                    creep.setTask(TASK.MOVE_TO_ROOM);
                    return;
                }

                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    let damagedStructure = creep._getDamagedStructure(0.9, true);
                    if (damagedStructure === ERR_NOT_FOUND) {
                        let constructionSite = creep._getConstructionSite();
                        if (constructionSite === ERR_NOT_FOUND) {
                            let nextRoom = creep.memory.route.shift();
                            creep.memory.route.push(nextRoom);
                            creep.memory.targetRoomName = nextRoom;
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
                creep.haulEnergy(TASK.DECIDE_WHAT_TO_DO);
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