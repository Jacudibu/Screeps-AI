const healer = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name === creep.targetRoomName) {
                    creep.setTask(TASK.HEAL);
                } else {
                    creep.setTask(TASK.MOVE_TO_ROOM)
                }
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.HEAL:
                let target = undefined;
                if (creep.taskTargetId) {
                    target = Game.getObjectById(creep.memory.taskTargetId);
                }

                if (!target) {
                    const damagedCreeps = creep.room.findDamagedCreeps();

                    if (damagedCreeps.length === 0) {
                        if (creep.previousTarget) {
                            target = Game.getObjectById(creep.previousTarget);
                        }

                        if (!target) {
                            target = creep.room.find(FIND_MY_CREEPS)[0];
                        }
                    } else {
                        target = damagedCreeps[0];
                    }
                }

                if (target) {
                    creep.previousTarget = target.id;
                    let result = this.heal;
                    if (creep.pos.getRangeTo(target) < 2) {
                        result = creep.heal(target);
                    } else {
                        result = creep.rangedHeal(target);
                        creep.travelTo(target);
                    }

                    switch (result) {
                        case OK:
                            creep.say(creepTalk.heal, true);
                            return;
                        case ERR_NOT_IN_RANGE:
                            creep.heal(creep);
                            break;
                        default:
                            break;
                    }
                }
                break;

            case TASK.WAIT:
                creep.say(creepTalk.waitingForGoodWeather);
                break;

            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

module.exports = healer;