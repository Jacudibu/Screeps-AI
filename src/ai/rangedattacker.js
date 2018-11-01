const guidedRangedAttacker = {
    run(creep) {
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    creep.setTask(TASK.ATTACK);
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.ATTACK:
                let target = undefined;
                if (creep.taskTargetId) {
                    target = Game.getObjectById(creep.taskTargetId);
                }

                if (!target) {
                    let possibleTargets = creep.room.find(FIND_HOSTILE_CREEPS);
                    if (possibleTargets.length === 0) {
                        creep.say(creepTalk.noTargetFound);
                        return;
                    }
                    target = utility.getClosestObjectFromArray(creep, possibleTargets);
                }

                if (target) {
                    let result = OK;
                    if (creep.hits === creep.hitsMax && creep.pos.getRangeTo(target.pos) === 1) {
                        result = creep.rangedMassAttack();
                        if (result === OK) {
                            creep.say(creepTalk.rangedMassAttack, true);
                        }
                    } else {
                        result = creep.rangedAttack(target);
                        if (result === OK) {
                            creep.say(creepTalk.rangedAttack, true);
                        }
                    }

                    switch (result) {
                        case OK:
                            if (target instanceof Creep) {
                                if (target.countBodyPartsOfType(ATTACK) > 0) {
                                    // Kiting!
                                    creep.kite(target, {range: 3});
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
                break;

            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

module.exports = guidedRangedAttacker;