const guidedRangedAttacker = {
    run(creep) {
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    creep.setTask(TASK.WAIT);
                    //creep.setTask(TASK.ATTACK);
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.WAIT_FOR_INPUT:
                creep.say(creepTalk.tableFlip, true);
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.ATTACK:
                let target = undefined;
                if (creep.taskTargetId) {
                    target = Game.getObjectById(creep.taskTargetId);
                }

                if (target) {
                    creep.say(creepTalk.attack, true);
                    let result = OK;
                    if (creep.hits === creep.hitsMax && creep.pos.getRangeTo(target.pos) === 1) {
                        result = creep.rangedMassAttack();
                    } else {
                        result = creep.rangedAttack(target);
                    }

                    switch (result) {
                        case OK:
                            if (target instanceof Creep) {
                                if (target.countBodyPartsOfType(ATTACK) > 0) {
                                    // Kiting!
                                    creep.travelTo(target,  {range: 2});
                                }else {
                                    // Mass attacking!
                                    creep.travelTo(target);
                                }
                            }
                            return;
                        case ERR_NOT_IN_RANGE:
                            creep.travelTo(target, {range: 3, ignoreCreeps: false});
                            break;
                        case ERR_INVALID_TARGET:
                            break;
                        default:
                            break;
                    }
                }

                // TODO: Find owned & damaged Creeps in range
                // TODO: Use findInRange instead of room.find? Profiling time!

                let possibleTargets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: target => creep.pos.getRangeTo(target) < 4});
                if (possibleTargets.length === 0) {
                    creep.say(creepTalk.noTargetFound);
                    return;
                }

                target = utility.getClosestObjectFromArray(creep, possibleTargets);

                if (creep.hits === creep.hitsMax && creep.pos.getRangeTo(target.pos) === 1) {
                    creep.rangedMassAttack();
                } else {
                    creep.rangedAttack(target);
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

module.exports = guidedRangedAttacker;