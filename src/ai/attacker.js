const attacker = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.targetRoomName) {
                    if (creep.memory.targetRoomName === 'E57S48') {
                        creep.memory.taskTargetId = '5b5a4f8365965e6dc7b2340a';
                    }
                    creep.setTask(TASK.ATTACK);
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.ATTACK);
                break;
            case TASK.WAIT_FOR_INPUT:
                creep.say("(ノ°Д°）ノ︵┻━┻");
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.ATTACK:
                let target = undefined;
                if (creep.memory.taskTargetId) {
                    target = Game.getObjectById(creep.memory.taskTargetId);
                } else {
                    target = Game.getObjectById('5b5a4f8365965e6dc7b2340a');
                }

                if (target === undefined) {
                    let possibleTargets = creep.room.find(FIND_HOSTILE_CREEPS);
                    if (possibleTargets.length === 0) {
                        /*
                        possibleTargets = creep.room.find(FIND_HOSTILE_STRUCTURES);
                        if (possibleTargets.length === 0) {
                            creep.setTask(TASK.WAIT_FOR_INPUT);
                            return;
                        }
                        */

                            creep.say("*zZz*");
                            return;
                        }
                        creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                        return;

                        /*
                        possibleTargets.sort(function(a, b) {
                            return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                        });
                        */

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