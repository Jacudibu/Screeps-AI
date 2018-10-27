const defender = {
    run(creep) {
        let attackResult = ERR_NOT_FOUND;
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    if (creep.room.name === creep.memory.homeRoomName && creep.room.memory.requiresHelp === undefined) {
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
                attackResult = creep.defendRoomWithRangedAttacks(true);
                break;
            case TASK.DEFEND_CHARGE:
                attackResult = creep.defendRoomWithRangedAttacks(false);
                break;
            case TASK.RECYCLE:
                creep.recycle();
                break;
            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }

        if (creep.hits < creep.hitsMax && attackResult !== OK) {
            creep.heal(creep);
        }
    },
};

module.exports = defender;