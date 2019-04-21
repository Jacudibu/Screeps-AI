const DEFAULT_KITE_RANGE = 3;
const DEFAULT_FLEE_RANGE = 5;

/**
 * Makes a creep flee from hostiles if there where any.
 * returns ERR_NOT_FOUND if no hostiles are nearby or the result of creep.kite.
 */
Creep.prototype.fleeFromNearbyEnemies = function(shouldCarryBeDropped = false) {
    if (this.room._dangerousHostiles && this.room._dangerousHostiles.length > 0) {
        for (let hostile of this.room._dangerousHostiles) {
            if (this.pos.getRangeTo(hostile) <= DEFAULT_FLEE_RANGE) {
                if (this.room.lookAt(this.pos).some(x => x.type === LOOKAT_RESULT_TYPES.STRUCTURE && x.structure.structureType === STRUCTURE_RAMPART)) {
                    return ERR_NOT_FOUND;
                }

                if (shouldCarryBeDropped && _.sum(this.carry) > 0) {
                    this.drop(RESOURCE_ENERGY);
                }

                if (this.task === TASK.HARVEST_ENERGY || this.task === TASK.MOVE_ONTO_CONTAINER) {
                    utility.reduceSourceWorkerAssignedCount(this.taskTargetId);
                }
                this.setTask(TASK.DECIDE_WHAT_TO_DO);

                this.say(this.ticksToLive % 2 === 0 ? creepTalk.flee1 : creepTalk.flee2, true);
                return this.kite(this.room._dangerousHostiles, {range: DEFAULT_FLEE_RANGE});
            }
        }
    }

    return ERR_NOT_FOUND;
};

/**
 * Makes a creep keep its distance to a given object or array of objects.
 *
 * Options:
 *  - offRoad: If true, every terrain (except walls) has a matrix cost of 1. Defaults to false.
 *  - ignoreRoads: If true, plains will have a matrix cost of 1. Defaults to false.
 *  - range: The Range that should be kept. Defaults to DEFAULT_KITE_RANGE.
 */
Creep.prototype.kite = function(thingsToKite, options = {}) {
    if (!thingsToKite) {
        return ERR_INVALID_ARGS;
    }

    if (this.fatigue > 0) {
        Traveler.circle(this.pos, "aqua", .3);
        return ERR_TIRED;
    }

    if (this.spawning) {
        return ERR_BUSY;
    }

    const range = options.range ? options.range : DEFAULT_KITE_RANGE;

    let fancyGoalObject = [];

    if (thingsToKite instanceof Array) {
        for (const thing of thingsToKite) {
            fancyGoalObject.push(turnIntoGoalObject(thing, range));
        }
    } else {
        fancyGoalObject.push(turnIntoGoalObject(thingsToKite, range));
    }

    const pathFinderResult = PathFinder.search(this.pos, fancyGoalObject, {
        maxRooms: 2,
        plainCost: 1,
        swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 5,
        flee: true,
        roomCallback: callback,
    });

    let nextDirection = this.pos.getDirectionTo(pathFinderResult.path[0]);
    return this.move(nextDirection);
    //return this.moveAndPush(nextDirection);
};

const turnIntoGoalObject = function(thing, range) {
    let goal = {};
    if (thing instanceof RoomPosition) {
        goal.pos = thing;
    } else {
        goal.pos = thing.pos;
    }

    goal.range = range;

    return goal;
};

const callback = function(roomName) {
    let room = Game.rooms[roomName];
    if (room) {
        return Traveler.getCreepMatrix(room);
    }

    return false;
};