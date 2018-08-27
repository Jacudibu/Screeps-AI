const attacker = {
    run: function (creep) {
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.targetRoomName) {
                    creep.setTask(TASK.WAIT);
                    //creep.setTask(TASK.ATTACK);
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.WAIT);
                break;
            case TASK.WAIT_FOR_INPUT:
                creep.say("(ノ°Д°）ノ︵┻━┻", true);
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
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
                            creep.say("*zZz*");
                            return;
                        }


                    }

                    target = _.sortBy(possibleTargets, c => creep.pos.getRangeTo(c))[0];
                }

                creep.say(":<", true);
                switch (creep.attack(target)) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.travelTo(target);
                        break;
                    case ERR_INVALID_TARGET:
                        creep.setTask(TASK.WAIT_FOR_INPUT);
                        break;
                    default:
                        console.log("??");
                        break;
                }
                break;
            case TASK.WAIT:
                creep.say('lalala', true);
                break;
            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

module.exports = attacker;