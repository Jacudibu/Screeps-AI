const SKIP_ROOMS_WITH_TOWERS = true;

const ai = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                creep.room.updateScoutData();

                if (!roomThreats[creep.room.name] && creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
                    creep.setTask(TASK.ATTACK);
                    break;
                }

                if (creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).length > 0) {
                    creep.setTask(TASK.STOMP_HOSTILE_CONSTRUCTION_SITES);
                    break;
                }

                continueScouting(creep);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO, {preferHighway: true, ignoreRoads: true});
                break;

            case TASK.ATTACK:
                if (roomThreats[creep.room.name]) {
                    creep.say(creepTalk.flee3, true);
                    continueScouting(creep);
                    return;
                }

                if (creep.room.controller && creep.room.controller.safeMode) {
                    creep.say(creepTalk.safeModeActived, true);
                    continueScouting(creep);
                    return;
                }

                attackHostiles(creep);
                break;

            case TASK.STOMP_HOSTILE_CONSTRUCTION_SITES:
                if (roomThreats[creep.room.name]) {
                    if (   !creep.room.controller
                        || !creep.room.controller.safeMode
                        || roomThreats[creep.room.name].players.includes(creep.room.controller.owner.username)) {
                        creep.say(creepTalk.flee3);
                        continueScouting(creep);
                        break;
                    }
                }

                const result = creep.stompHostileConstructionSites();
                if (result === ERR_NOT_FOUND) {
                    continueScouting(creep);
                    break;
                }
                break;

            case TASK.DISABLE_ATTACK_NOTIFICATION:
                creep.notifyWhenAttacked(false);

                creep.task = creep.targetRoomName ? TASK.MOVE_TO_ROOM : TASK.DECIDE_WHAT_TO_DO;
                this.run(creep);
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    },
};

const attackHostiles = function(creep) {
    let target;
    if (creep.taskTargetId) {
        target = Game.getObjectById(creep.taskTargetId);
    }

    if (!target) {
        const allHostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (allHostiles.length > 0) {
            const workers = allHostiles.filter(c => c.countBodyPartsOfType(WORK > 2));
            if (workers.length > 0) {
                target = utility.getClosestObjectFromArray(creep, workers);
            } else {
                target = utility.getClosestObjectFromArray(creep, allHostiles);
            }
        }

        if (target) {
            creep.taskTargetId = target.id;
        }
    }

    if (!target) {
        continueScouting(creep);
        return;
    }

    const result = creep.attack(target);
    switch (result) {
        case OK:
            creep.say(creepTalk.tableFlip, true);
            return;
        case ERR_NOT_IN_RANGE:
            creep.say(creepTalk.attack, true);
            creep.travelTo(target);
            return;
        default:
            continueScouting(creep);
            return;
    }
};

const continueScouting = function(creep) {
    creep.selectNextRoomToScout(SKIP_ROOMS_WITH_TOWERS);
    creep.setTask(TASK.MOVE_TO_ROOM);
    creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
};

module.exports = ai;