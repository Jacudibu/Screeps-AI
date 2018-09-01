const hauler = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.HAUL_RESOURCE:
                creep.haulAnyResource(TASK.STORE_RESOURCE);
                break;

            case TASK.STORE_RESOURCE:
                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.storeEnergy(TASK.HAUL_RESOURCE);
                    break;
                }

                if (_.sum(creep.carry) > 0) {
                    creep.storeMineral(TASK.HAUL_RESOURCE);
                    break;
                }

                creep.setTask(TASK.HAUL_RESOURCE);
                break;

            case TASK.RENEW_CREEP:
                creep.renew(TASK.HAUL_RESOURCE);
                break;

            case TASK.MOVE_TO_ROOM:
                if (!creep.memory.targetRoomName) {
                    if (creep.memory.respawnTTL) {
                        delete creep.memory.respawnTTL;
                    }
                    creep.memory.targetRoomName = creep.memory.spawnRoom;
                }

                creep.moveToRoom(TASK.STORE_RESOURCE);
                break;

            default:
                creep.setTask(TASK.HAUL_RESOURCE);
                break;
        }
    },
};

module.exports = hauler;