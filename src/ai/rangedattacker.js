const ai = {
    run(creep) {
        creep.healNearbyWoundedCreeps();

        const nearbyHostiles = creep.findNearbyHostiles();
        if (nearbyHostiles !== ERR_NOT_FOUND) {
            creep.attackNearbyHostilesWithRangedAttacks(nearbyHostiles);
        }

        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                decideWhatToDo(creep);
                this.run(creep);
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
                    if (nearbyHostiles !== ERR_NOT_FOUND) {
                        target = nearbyHostiles[0];
                    } else {
                        let possibleTargets = creep.room.find(FIND_HOSTILE_CREEPS);
                        if (possibleTargets.length === 0) {
                            creep.say(creepTalk.noTargetFound);
                            return;
                        }
                        target = utility.getClosestObjectFromArray(creep, possibleTargets);
                    }
                }

                if (target) {
                    creep.attackTargetWithRangedAttacks(nearbyHostiles, target);
                } else {
                    creep.stompHostileConstructionSites();
                }
                break;

            case TASK.DISABLE_ATTACK_NOTIFICATION:
                creep.notifyWhenAttacked(false);
                creep.task = TASK.DECIDE_WHAT_TO_DO;
                this.run(creep);
                break;

            default:
                creep.setTask(TASK.MOVE_TO_ROOM);
                break;
        }
    },
};

const decideWhatToDo = function(creep) {
    if (creep.room.name === creep.targetRoomName) {
        creep.setTask(TASK.ATTACK);
    } else {
        creep.setTask(TASK.MOVE_TO_ROOM)
    }
};




module.exports = ai;