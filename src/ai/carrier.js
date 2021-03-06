const carrier = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.remoteHaulTargetRoom) {
                    if (_.sum(creep.carry) === 0) {
                        if (creep.respawnTTL === -1) {
                            if (creep.room.terminal) {
                                creep.respawnTTL = null;
                            } else {
                                creep.addRespawnEntryToSpawnQueue();
                            }
                            creep.setTask(TASK.RECYCLE);
                        } else {
                            creep.targetRoomName = creep.remoteHaulStorageRoom;
                            creep.setTask(TASK.MOVE_TO_ROOM);
                        }
                    } else {
                        creep.setTask(TASK.STORE_ENERGY);
                    }
                } else if (creep.room.name === creep.remoteHaulStorageRoom) {
                    if (!creep.respawnTTL) {
                        creep.setTask(TASK.RECYCLE);
                    }

                    if (_.sum(creep.carry) === creep.carryCapacity) {
                        creep.targetRoomName = creep.remoteHaulTargetRoom;
                        creep.setTask(TASK.MOVE_TO_ROOM);
                    } else {
                        creep.setTask(TASK.COLLECT_ENERGY);
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.STORE_ENERGY:
                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.storeEnergy(TASK.DECIDE_WHAT_TO_DO);
                } else {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                }
                break;
            case TASK.RECYCLE:
                creep.recycle();
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = carrier;