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
    log.warning(this.room.name + " |" + this.name + ": " + action + " resulted in unhandled error code " + errorCode)
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
            Memory.rooms[args.targetRoomName].assignedHaulers++;
            break;
        case ROLE.REMOTE_WORKER:
            args.targetRoomName = this.memory.targetRoomName;
            args.respawnTTL = this.memory.respawnTTL;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            break;
        case ROLE.REMOTE_HARVESTER:
            args.targetRoomName = this.memory.targetRoomName;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            Memory.rooms[args.targetRoomName].assignedHarvesters++;
            break;
        case ROLE.REMOTE_REPAIRER:
            args.targetRoomName = this.memory.targetRoomName;
            args.route = this.memory.route;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            break;
        case ROLE.REMOTE_UPGRADER:
            args.targetRoomName = this.memory.targetRoomName;
            args.respawnTTL = this.memory.respawnTTL;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            break;
        case ROLE.CARRIER:
            args.targetRoomName = this.memory.remoteHaulTargetRoom;
            args.storageRoomName = this.memory.remoteHaulStorageRoom;
            args.respawnTTL = this.memory.respawnTTL;
            Game.rooms[this.memory.spawnRoom].addToSpawnQueueEnd(args);
            break;
        default:
            log.warning("undefined role asking for respawn?!" + args.role);
    }

    this.memory.respawnTTL = undefined;
};

// ~~~~~~~~~~~~~~~~~~
// ~~ Small Helpers ~~
// ~~~~~~~~~~~~~~~~~~

Creep.prototype._withdrawEnergy = function(storage, taskWhenFinished) {
    this.say("o~o", true);
    switch (this.withdraw(storage, RESOURCE_ENERGY)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(storage);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.memory.taskTargetId = undefined;
            break;
        default:
            this.logActionError("Collecting Energy", this.withdraw(storage, RESOURCE_ENERGY));
            break;
    }
};

Creep.prototype._withdrawResource = function(storage, taskWhenFinished) {
    this.say("o~o'", true);

    switch (this.withdraw(storage, this.memory.hauledResourceType)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(storage);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.memory.taskTargetId = undefined;
            break;
        default:
            this.logActionError("Withdrawing " + this.memory.hauledResourceType,
                                this.withdraw(storage, this.memory.hauledResourceType));
            break;
    }
};

Creep.prototype._pickupEnergy = function(pickup, taskWhenFinished, onlyPickupThisOne) {
    this.say("°^°", true);
    switch (this.pickup(pickup)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity || onlyPickupThisOne) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(pickup);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_INVALID_TARGET:
            this.resetCurrentTask();
            break;
        default:
            this.logActionError("Picking up Energy ", this.pickup(pickup));
            break;
    }
};