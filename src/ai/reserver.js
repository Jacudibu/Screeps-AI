const reserver = {
    run(creep) {
        if (creep.task !== TASK.MOVE_TO_ROOM && creep.fleeFromNearbyEnemies(true) !== ERR_NOT_FOUND) {
            return;
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    creep.setTask(TASK.SIGN_CONTROLLER)
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.RESERVE_CONTROLLER:
                creep.reserveRoomController();
                break;

            case TASK.SIGN_CONTROLLER:
                creep.signRoomController(TASK.CHECK_REMOTE_ROAD_REGENERATION);
                break;

            case TASK.CHECK_REMOTE_ROAD_REGENERATION:
                if (!creep.room.memory.layout || !creep.room.memory.layout.roads || !creep.room.memory.layout.roads.sources) {
                    if (Memory.rooms[creep.spawnRoom].layout) {
                        log.warning(creep + " forced a remote road regeneration in " + creep.room.name);
                        creep.room.forceRemoteRoadRegeneration(creep.spawnRoom);
                    }
                }

                creep.setTask(TASK.RESERVE_CONTROLLER);
                this.run(creep);
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};

module.exports = reserver;