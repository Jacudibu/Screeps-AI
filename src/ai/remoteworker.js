const remoteWorker = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.memory.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }

                if (_.sum(creep.carry) < 10) {
                    creep.determineHarvesterStartTask(TASK.HARVEST_ENERGY_FETCH);
                    return;
                }

                if (creep._getDamagedStructure(0.5, true) !== ERR_NOT_FOUND) {
                    creep.memory.task = TASK.REPAIR_STRUCTURE;
                    return;
                }

                if (creep._getConstructionSite() !== ERR_NOT_FOUND) {
                    creep.memory.task = TASK.BUILD_STRUCTURE;
                    return;
                }

                if (creep.findClosestFreeEnergyStorage() !== ERR_NOT_FOUND) {
                    creep.setTask(TASK.STORE_ENERGY);
                    return;
                }

                creep.say('ಥ~ಥ', true);
                creep.drop(RESOURCE_ENERGY);
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.HARVEST_ENERGY_FETCH:
                creep.harvestEnergyAndFetch(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.BUILD_STRUCTURE:
                creep.buildStructures(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.DECIDE_WHAT_TO_DO, TASK.HARVEST_ENERGY_FETCH, 0.5, true);
                break;
            case TASK.STORE_ENERGY:
                creep.drop(RESOURCE_ENERGY);
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoContainer(TASK.HARVEST_ENERGY_FETCH);
                break;
            case TASK.DISMANTLE:
                creep.dismantleStructure(TASK.DECIDE_WHAT_TO_DO);
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports =remoteWorker;