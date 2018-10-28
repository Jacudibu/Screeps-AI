const remoteWorker = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }

                if (_.sum(creep.carry) < 10) {
                    creep.setTask(TASK.HARVEST_ENERGY);
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

                creep.say(creepTalk.dropResource, true);
                creep.drop(RESOURCE_ENERGY);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.HARVEST_ENERGY:
                if (_.sum(creep.carry) === creep.carryCapacity) {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                    this.run(creep);
                    return;
                }
                creep.harvestEnergyInLowRCLRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.BUILD_STRUCTURE:
                creep.buildStructures(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.DECIDE_WHAT_TO_DO, TASK.HARVEST_ENERGY, 0.5, true);
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoContainer(TASK.HARVEST_ENERGY);
                break;
            case TASK.DISMANTLE:
                creep.dismantleStructure(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.DECIDE_WHAT_TO_DO);
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports =remoteWorker;