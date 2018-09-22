const reserver = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                creep.room.updateScoutData();
                creep.selectNextRoomToScout();
                creep.setTask(TASK.MOVE_TO_ROOM);
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
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

module.exports = reserver;