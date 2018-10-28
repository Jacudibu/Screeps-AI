const healer = {
    run(creep) {
        switch (creep.memory.task) {
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
                if (creep.memory.taskTargetId) {
                    target = Game.getObjectById(creep.memory.taskTargetId);
                }

                if (!target) {
                    const myCreeps = creep.room.find(FIND_MY_CREEPS);
                    const damagedCreeps = myCreeps.filter(c => c.hits < c.hitsMax);

                    if (damagedCreeps.length === 0) {
                        target = myCreeps[0];
                    } else {
                        target = damagedCreeps[0];
                    }
                }

                if (target) {
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