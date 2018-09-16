const defender = {
    run(creep) {
        let attackResult = ERR_NOT_FOUND;

        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.targetRoomName) {
                    if (creep.room.name === creep.memory.homeRoomName && creep.room.memory.requiresHelp === undefined) {
                        creep.setTask(TASK.RECYCLE);
                    } else {
                        if (creep.room.mySpawns.length > 0) {
                            creep.setTask(TASK.DEFEND_STAY_ON_RAMPART);
                        } else {
                            creep.setTask(TASK.DEFEND_MELEE_CHARGE);
                        }
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.DEFEND_STAY_ON_RAMPART:
                attackResult = creep.defendRoomByStandingOnRamparts();
                break;
            case TASK.DEFEND_MELEE_CHARGE:
                attackResult = creep.defendRoomByChargingIntoEnemy();
                break;
            case TASK.RECYCLE:
                creep.recycle();
                break;
            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }

        if (attackResult !== OK) {
            creep.heal(creep);
        }
    },
};

module.exports = defender;