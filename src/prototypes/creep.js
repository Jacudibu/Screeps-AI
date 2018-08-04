Creep.prototype.setTask = function(task, keepTaskTargetId) {
    if (!keepTaskTargetId) {
        this.memory.taskTargetId = undefined;
    }

    this.memory.task = task;
};

Creep.prototype.resetCurrentTask = function() {
    this.memory.taskTargetId = undefined;
};

Creep.prototype.countBodyPartsOfType = function(types) {
    return _.filter(this.body, function(bodyPart) {return bodyPart.type === types}).length;
};

Creep.prototype.logActionError = function(action, errorCode) {
    console.log(this.room.name + " |" + this.name + ": " + action + " resulted in unhandled error code " + errorCode)
};

Creep.prototype.addRespawnEntryToSpawnQueue = function() {
    let args = {
        role: this.memory.role,
    };

    // Handle special cases with counts in memory
    switch (args.role) {
        case ROLE.HAULER:
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueStart(args);
            break;
        case ROLE.HARVESTER:
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueStart(args);
            break;
        case ROLE.REMOTE_HAULER:
            args.targetRoomName = this.memory.remoteHaulTargetRoom;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            Game.rooms[args.targetRoomName].memory.assignedHaulers++;
            break;
        case ROLE.REMOTE_WORKER:
            args.targetRoomName = this.memory.targetRoomName;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            Game.rooms[args.targetRoomName].memory.assignedRemoteWorkers++;
            break;
        default:
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
    }

    this.memory.respawnTTL = undefined;
};

// ~~~~~~~~~~~~~~~~~~
// ~~ Small Helpers ~~
// ~~~~~~~~~~~~~~~~~~

Creep.prototype._withdrawEnergy = function(storage, taskWhenFinished) {
    this.say("o~o");
    switch (this.withdraw(storage, RESOURCE_ENERGY)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(storage);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.memory.taskTargetId = undefined;
            break;
        default:
            console.log("Collecting Energy resulted in unhandled error: " + this.withdraw(storage, RESOURCE_ENERGY));
            break;
    }
};

Creep.prototype._pickupEnergy = function(pickup, taskWhenFinished, onlyPickupThisOne) {
    this.say("°^°");
    switch (this.pickup(pickup)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity || onlyPickupThisOne) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(pickup);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_INVALID_TARGET:
            this.resetCurrentTask();
            break;
        default:
            console.log("Picking up Energy resulted in unhandled error: " + this.pickup(pickup) + "\n" + pickup + "-->" + JSON.stringify(pickup));
            break;
    }
};