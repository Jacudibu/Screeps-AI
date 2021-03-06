const remoteHauler = {
    run(creep) {
        if (creep.task !== TASK.MOVE_TO_ROOM && creep.fleeFromNearbyEnemies(true) !== ERR_NOT_FOUND) {
            return;
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.remoteHaulTargetRoom) {
                    if (_.sum(creep.carry) === creep.carryCapacity) {
                        creep.targetRoomName = creep.remoteHaulStorageRoom;
                        creep.setTask(TASK.MOVE_TO_ROOM);
                    } else {
                        creep.setTask(TASK.HAUL_RESOURCE);
                    }
                } else if (creep.room.name === creep.remoteHaulStorageRoom) {
                    if (_.sum(creep.carry) === 0) {
                        if (creep.respawnTTL != null) {
                            creep.targetRoomName = creep.remoteHaulTargetRoom;
                            creep.setTask(TASK.MOVE_TO_ROOM_OFFROAD);
                        } else {
                            // respawn has triggered and we are going to die soon - better now than later!
                            creep.suicide();
                        }
                    } else {
                        creep.setTask(TASK.STORE_RESOURCE);
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }
                break;

            case TASK.HAUL_RESOURCE:
                if (_.sum(creep.carry) < creep.carryCapacity) {
                    creep.haulAnyResource(TASK.DECIDE_WHAT_TO_DO);
                } else {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                }
                break;

            case TASK.STORE_RESOURCE:
                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.storeEnergy(TASK.DECIDE_WHAT_TO_DO);
                    break;
                }

                if (_.sum(creep.carry) > 0) {
                    creep.storeMineral(TASK.DECIDE_WHAT_TO_DO);
                    break;
                }

                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;


            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.MOVE_TO_ROOM_OFFROAD:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO, {offRoad: true});
                break;

            case TASK.HAUL_ENERGY:
                creep.haulEnergy(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.STORE_ENERGY:
                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.storeEnergy(TASK.DECIDE_WHAT_TO_DO);
                } else {
                    creep.storeMineral(TASK.DECIDE_WHAT_TO_DO);
                }
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = remoteHauler;