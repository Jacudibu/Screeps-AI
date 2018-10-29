const repairer = {
    run(creep) {
        switch (creep.task) {
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.REPAIR_STRUCTURE);
                break;
            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.BUILD_STRUCTURE);
                break;
            case TASK.BUILD_STRUCTURE:
                creep.buildStructures(TASK.UPGRADE_CONTROLLER);
                break;
            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.COLLECT_ENERGY);
                break;
            case TASK.RENEW_CREEP:
                creep.renew(TASK.COLLECT_ENERGY);
                break;
            default:
                creep.setTask(TASK.COLLECT_ENERGY);
                break;
        }
    },
};

module.exports = repairer;