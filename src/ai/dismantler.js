const dismantler = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    creep.setTask(TASK.DISMANTLE)
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM, true);
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO, undefined, true);
                break;
            case TASK.DISMANTLE:
                creep.dismantleStructure(TASK.DECIDE_WHAT_TO_DO);
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = dismantler;