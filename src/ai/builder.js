const builder = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.BUILD_STRUCTURE);
                break;
            case TASK.BUILD_STRUCTURE:
                creep.buildStructures();
                break;
            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures();
                break;
            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController();
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

module.exports = builder;