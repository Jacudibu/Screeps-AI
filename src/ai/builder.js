const builder = {
    run(creep) {
        switch (creep.task) {
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.BUILD_STRUCTURE);
                break;
            case TASK.BUILD_STRUCTURE:
                creep.buildStructures(TASK.REPAIR_STRUCTURE, TASK.COLLECT_ENERGY, true);
                break;
            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.UPGRADE_CONTROLLER);
                break;
            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.COLLECT_ENERGY);
                break;
            case TASK.RENEW_CREEP:
                creep.renew(TASK.COLLECT_ENERGY);
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.BUILD_STRUCTURE);
                break;
            default:
                creep.setTask(TASK.COLLECT_ENERGY);
                break;
        }
    },
};

module.exports = builder;