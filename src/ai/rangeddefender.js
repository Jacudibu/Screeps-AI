const defender = {
    run(creep) {
        let attackResult = ERR_NOT_FOUND;
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    if (creep.room.name === creep.memory.homeRoomName && creep.room.memory.requiresHelp === undefined) {
                        creep.setTask(TASK.RECYCLE);
                    } else {
                        creep.setTask(TASK.ATTACK);
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                    creep.notifyWhenAttacked(false);
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.ATTACK:
                attackResult = creep.defendRoomByChargingIntoEnemy();
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