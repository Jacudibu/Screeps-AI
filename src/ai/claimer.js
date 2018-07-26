const claimer = {
    run: function(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.targetRoomName) {
                    creep.setTask(TASK.CLAIM_CONTROLLER)
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.CLAIM_CONTROLLER:
                creep.claimRoomController();
                break;
            case TASK.RESERVE_CONTROLLER:
                creep.reserveRoomController();
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = claimer;