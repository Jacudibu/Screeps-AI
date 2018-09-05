const remoteUpgrader = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.memory.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                    return;
                }

                if (_.sum(creep.carry) < 10) {
                    if (creep.room.controller && creep.room.controller.level === 8) {
                        // TODO: easy fix for now,should be removed once supportRooms are implemented
                        creep.room.memory.requestedCreeps.upgrader = 1;
                        creep.memory.respawnTTL = undefined;
                    }

                    creep.setTask(TASK.COLLECT_ENERGY);
                    return;
                }

                creep.setTask(TASK.UPGRADE_CONTROLLER);
                break;

            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.UPGRADE_CONTROLLER);
                break;

            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.COLLECT_ENERGY);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = remoteUpgrader;