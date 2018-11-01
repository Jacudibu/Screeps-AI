const ai = {
    run(creep) {
        healStuff(creep);

        const nearbyHostiles = findNearbyHostiles(creep);
        if (nearbyHostiles !== ERR_NOT_FOUND) {
            attackNearbyHostiles(creep, nearbyHostiles);
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
                    attackTarget(creep, nearbyHostiles, target);
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

const healStuff = function(creep) {
    if (creep.hits < creep.hitsMax) {
        return creep.heal(creep);
    } else {
        const nearbyDamagedFriends = findNearbyDamagedFriends(creep);
        if (nearbyDamagedFriends !== ERR_NOT_FOUND) {
            const friendsRightNextToCreep = nearbyDamagedFriends.filter(c => creep.pos.getRangeTo(c) === 1);
            if (friendsRightNextToCreep.length > 0) {
                return creep.heal(friendsRightNextToCreep[0]);
            } else {
                return creep.rangedHeal(nearbyDamagedFriends[0]);
            }
        }
    }

    return false;
};

const findNearbyHostiles = function(creep) {
    const result = creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => creep.pos.getRangeTo(c) <= CREEP_RANGED_ATTACK_RANGE});

    if (result.length === 0) {
        return ERR_NOT_FOUND;
    }

    return result;
};

const findNearbyDamagedFriends = function(creep) {
    const result = creep.room.find(FIND_MY_CREEPS, {filter: c => creep.pos.getRangeTo(c) <= CREEP_RANGED_HEAL_RANGE && creep.hits < creep.hitsMax});
    if (result.length === 0) {
        return ERR_NOT_FOUND;
    }

    return result;
};

 const attackNearbyHostiles = function(creep, nearbyHostiles) {
    if (nearbyHostiles.length > 3) {
        creep.say(creepTalk.rangedMassAttack, true);
        creep.rangedMassAttack();
    } else {
        creep.say(creepTalk.rangedAttack, true);
        creep.rangedAttack(nearbyHostiles[0]);
    }
};

const attackTarget = function(creep, nearbyHostiles, target) {
    let result = OK;
    if (creep.pos.getRangeTo(target.pos) === 1) {
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
            if (nearbyHostiles !== ERR_NOT_FOUND && nearbyHostiles.some(c => c.isMeleeAttacker())) {
                creep.kite(nearbyHostiles, {range: CREEP_RANGED_ATTACK_RANGE});
                break;
            }

            // Mass attacking or no melee creeps in range!
            creep.travelTo(target);
            return;

        case ERR_NOT_IN_RANGE:
            creep.travelTo(target, {range: CREEP_RANGED_ATTACK_RANGE, ignoreCreeps: false});
            break;

        case ERR_INVALID_TARGET:
            break;

        default:
            break;
    }

    return result;
};

module.exports = ai;