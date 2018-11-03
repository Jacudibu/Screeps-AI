const ai = {
    run(creep) {
        creep.healNearbyWoundedCreeps();

        let attackResult = ERR_NOT_FOUND;
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    if (creep.room.name === creep.memory.homeRoomName && creep.room.memory.requiresHelp === undefined && !creep.stayInRoom) {
                        creep.setTask(TASK.RECYCLE);
                    } else {
                        if (creep.room.mySpawns.length > 0) {
                            creep.setTask(TASK.DEFEND_RAMPARTS);
                        } else {
                            creep.setTask(TASK.DEFEND_CHARGE);
                        }
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                    creep.notifyWhenAttacked(false);
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.DEFEND_RAMPARTS:
                attackResult = creep.defendRoomWithRangedAttacks(DEFEND_ON_RAMPARTS);
                break;
            case TASK.DEFEND_CHARGE:
                attackResult = creep.defendRoomWithRangedAttacks(DEFEND_CHARGE);
                break;
            case TASK.RECYCLE:
                creep.recycle();
                break;
            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

module.exports = ai;