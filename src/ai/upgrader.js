const upgrader = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.UPGRADE_CONTROLLER);
                break;
            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController();
                break;
            case TASK.RENEW_CREEP:
                creep.renew(TASK.HARVEST_ENERGY);
                break;
            default:
                creep.setTask(TASK.COLLECT_ENERGY);
                break;
        }
    },
};

module.exports = upgrader;