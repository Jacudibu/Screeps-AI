const attacker = {
    run(creep) {
        if (creep.hits < creep.hitsMax && !creep.memory.taskTargetId) {
            creep.heal(creep);
        }

        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.memory.targetRoomName) {
                    //creep.setTask(TASK.WAIT);
                    creep.setTask(TASK.ATTACK);
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.ATTACK);
                break;

            case TASK.WAIT_FOR_INPUT:
                creep.say(creepTalk.tableFlip, true);
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
                        possibleTargets = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: structure => structure.structureType !== STRUCTURE_CONTROLLER});
                        if (possibleTargets.length === 0) {
                            possibleTargets = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                            if (possibleTargets.length === 0) {
                                creep.say(creepTalk.waitingForInput);
                                return;
                            }

                            target = utility.getClosestObjectFromArray(this, possibleTargets);
                            creep.travelTo(target);
                            return;
                        }
                    }

                    target = utility.getClosestObjectFromArray(this, possibleTargets);
                }

                creep.say(creepTalk.attack, true);
                switch (creep.attack(target)) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.travelTo(target, {ignoreCreeps: false});
                        break;
                    case ERR_INVALID_TARGET:
                        creep.setTask(TASK.WAIT_FOR_INPUT);
                        break;
                    default:
                        break;
                }
                break;

            case TASK.WAIT:
                creep.say(creepTalk.wait, true);
                break;

            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

module.exports = attacker;