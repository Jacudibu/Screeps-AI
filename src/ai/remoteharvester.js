const remoteHarvester = {
    run(creep) {
        if (creep.task !== TASK.MOVE_TO_ROOM && creep.fleeFromNearbyEnemies(true) !== ERR_NOT_FOUND) {
            return;
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }

                let startTask = creep.determineHarvesterStartTask();
                if (!startTask) {
                    return;
                }

                if (creep.respawnTTL === RESPAWN_TTL_NOT_YET_SET) {
                    creep.respawnTTL = CREEP_LIFE_TIME - creep.ticksToLive;
                }
                this.run(creep);
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.HARVEST_ENERGY:
                creep.harvestEnergyInRemoteRoom();
                break;
            case TASK.STORE_ENERGY:
                creep.drop(RESOURCE_ENERGY);
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoContainer(TASK.HARVEST_ENERGY);
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = remoteHarvester;