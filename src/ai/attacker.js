const attacker = {
    run(creep) {
        let attackResult = ERR_NOT_FOUND;

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
                let target;
                if (creep.memory.taskTargetId) {
                    target = Game.getObjectById(creep.memory.taskTargetId);
                }

                if (!target) {
                    let possibleTargets = creep.room.find(FIND_HOSTILE_CREEPS);
                    if (possibleTargets.length === 0) {
                        possibleTargets = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: structure => structure.structureType !== STRUCTURE_CONTROLLER});
                        if (possibleTargets.length === 0) {
                            possibleTargets = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                            if (possibleTargets.length === 0) {
                                creep.say(creepTalk.waitingForSomething);
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
                attackResult = creep.attack(target);
                switch (attackResult) {
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

        if (creep.hits < creep.hitsMax && attackResult !== OK) {
            creep.heal(creep);
        }
    },
};

module.exports = attacker;