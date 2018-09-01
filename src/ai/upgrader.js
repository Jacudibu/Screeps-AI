const upgrader = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.UPGRADE_CONTROLLER);
                break;
            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.SIGN_CONTROLLER);
                break;
            case TASK.RENEW_CREEP:
                creep.renew(TASK.HARVEST_ENERGY);
                break;
            case TASK.SIGN_CONTROLLER:
                creep.signRoomController(TASK.COLLECT_ENERGY);
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.UPGRADE_CONTROLLER);
                break;
            default:
                creep.setTask(TASK.COLLECT_ENERGY);
                break;
        }
    },
};

module.exports = upgrader;