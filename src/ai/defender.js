const attacker = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.targetRoomName) {
                    if (creep.room.name === creep.memory.homeRoomName) {
                        creep.setTask(TASK.RECYCLE);
                    } else {
                        creep.setTask(TASK.ATTACK);
                    }
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.ATTACK);
                break;
            case TASK.ATTACK:
                let target = undefined;
                if (creep.memory.taskTargetId) {
                    target = Game.getObjectById(creep.memory.taskTargetId);
                }

                if (target === undefined) {
                    let possibleTargets = creep.room.find(FIND_HOSTILE_CREEPS);
                    if (possibleTargets.length === 0) {
                        possibleTargets = creep.room.find(FIND_HOSTILE_STRUCTURES);
                        if (possibleTargets.length === 0) {
                            creep.say("\\(^-^)/");
                            creep.memory.targetRoomName = creep.memory.homeRoomName;
                            creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                            return;
                        }

                        creep.say("*zZz*");
                        return;
                    }

                    _.sortBy(possibleTargets, c => creep.pos.getRangeTo(c));
                    target = possibleTargets[0];
                }

                creep.say("(ノ°Д°）ノ︵┻━┻");
                switch (creep.attack(target)) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target);
                        break;
                    case ERR_INVALID_TARGET:
                        creep.memory.taskTargetId = undefined;
                        break;
                }
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

module.exports = attacker;