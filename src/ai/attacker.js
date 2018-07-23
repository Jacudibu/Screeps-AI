const attacker = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.MOVE_TO_ROOM:
                if (creep.room.name === 'E58S47') {
                    creep.memory.targetRoomName = 'E59S47';
                } else if (creep.room.name === 'E59S47') {
                    creep.memory.targetRoomName = 'E59S48';
                } else if (creep.room.name === 'E59S48') {
                    creep.setTask(TASK.ATTACK);
                    creep.memory.taskTargetId = "5b54899f92b4c2424c331027";
                }
                creep.moveToRoom(TASK.WAIT_FOR_INPUT);
                break;
            case TASK.WAIT_FOR_INPUT:
                creep.say("(ノ°Д°）ノ︵┻━┻");
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
                            creep.setTask(TASK.WAIT_FOR_INPUT);
                            return;
                        }
                    }

                    possibleTargets.sort(function(a, b) {
                        return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                    });

                    _.sortBy(possibleTargets, c => creep.pos.getRangeTo(c));
                    target = possibleTargets[0];
                }

                switch (creep.attack(target)) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target);
                        break;
                    case ERR_INVALID_TARGET:
                        creep.setTask(TASK.WAIT_FOR_INPUT);
                        break;
                }
                break;
            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

module.exports = attacker;