const carrier = {
    run: function(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.remoteHaulTargetRoom) {
                    if (_.sum(creep.carry) === 0) {
                        creep.memory.targetRoomName = creep.memory.remoteHaulStorageRoom;
                        creep.setTask(TASK.MOVE_TO_ROOM);
                    } else {
                        creep.setTask(TASK.STORE_ENERGY);
                    }
                } else if (creep.room.name === creep.memory.remoteHaulStorageRoom) {
                    if (_.sum(creep.carry) === creep.carryCapacity) {
                        creep.memory.targetRoomName = creep.memory.remoteHaulTargetRoom;
                        creep.setTask(TASK.MOVE_TO_ROOM);
                    } else {
                        creep.setTask(TASK.COLLECT_ENERGY);
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.COLLECT_ENERGY:
                creep.collectEnergy(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.STORE_ENERGY:
                creep.storeEnergy(TASK.DECIDE_WHAT_TO_DO);
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports = carrier;