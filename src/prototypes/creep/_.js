Creep.prototype.setTask = function(task, keepTaskTargetId) {
    if (!keepTaskTargetId) {
        this.taskTargetId = undefined;
    }

    this.task = task;
};

Creep.prototype.resetCurrentTask = function() {
    this.taskTargetId = undefined;
};

Creep.prototype.countBodyPartsOfTypeAndApplyBoostWeighting = function(searchedPart) {
    return this.body.reduce((total, currentPart) => {
            if (currentPart.type === searchedPart) {
                if (currentPart.boost) {
                    return total + 1 + boostTiers[currentPart.boost];
                }

                return total + 1;
            }

            return total;
        }, 0);
};

Creep.prototype.logActionError = function(action, errorCode) {
    log.warning(this + " " + action + " resulted in unhandled error code " + errorCode)
};

Creep.prototype.addRespawnEntryToSpawnQueue = function() {
    let args = {
        role: this.role,
    };

    // Handle special cases with counts in memory
    switch (args.role) {
        case ROLE.HAULER:
            if (this.room.name !== this.spawnRoom) {
                // Happens when haulers decide to travel into distant lands and never turn back
                log.warning(this + " is in the wrong room and asks for a respawn. Does this happen more often? If so, try to find out why");
                break;
            }

            let spawnQueueCount = Memory.rooms[this.room.name].spawnQueue.filter(entry => entry.role === ROLE.HAULER).length;
            let aliveCount = this.room.find(FIND_MY_CREEPS).filter(creep => creep.role === ROLE.HAULER && creep.respawnTTL).length;

            if ((aliveCount + spawnQueueCount) <= this.room.requestedCreeps[ROLE.HAULER]) {
                addToSpawnQueueStart(this.spawnRoom, args);
            }
            break;
        case ROLE.HARVESTER:
            addToSpawnQueueStart(this.spawnRoom, args);
            break;
        case ROLE.REMOTE_HAULER:
            //args.targetRoomName = this.remoteHaulTargetRoom;
            //addToSpawnQueueEnd(this.spawnRoom, args);
            //Memory.rooms[args.targetRoomName].assignedHaulers++;
            break;
        case ROLE.REMOTE_WORKER:
            const constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
            if (this.room.energyCapacityAvailable >= 500) {
                break;
            }

            if (constructionSites && constructionSites.length > 0) {
                args.targetRoomName = this.targetRoomName;
                args.respawnTTL = this.respawnTTL;
                addToSpawnQueueEnd(this.spawnRoom, args);
            } else {
                log.warning(this.room + "|" + this.name + " -> Ignoring respawn, no construction Sites left.");
            }
            break;
        case ROLE.REMOTE_HARVESTER:
            args.targetRoomName = this.targetRoomName;
            addToSpawnQueueEnd(this.spawnRoom, args);
            Memory.rooms[args.targetRoomName].assignedHarvesters++;
            break;
        case ROLE.REMOTE_UPGRADER:
            args.targetRoomName = this.targetRoomName;
            args.respawnTTL = this.respawnTTL;
            addToSpawnQueueEnd(this.spawnRoom, args);
            break;
        case ROLE.CARRIER:
            args.targetRoomName = this.remoteHaulTargetRoom;

            if (Game.rooms[args.targetRoomName] && Game.rooms[args.targetRoomName].terminal) {
                break;
            }

            args.storageRoomName = this.remoteHaulStorageRoom;
            args.respawnTTL = this.respawnTTL;
            addToSpawnQueueEnd(this.spawnRoom, args);
            break;
        case ROLE.SCOUT:
            args.targetRoomName = this.targetRoomName;
            args.respawnTTL = this.respawnTTL;
            addToSpawnQueueStart(this.spawnRoom, args);
            break;
        default:
            log.warning(this + " undefined role asking for respawn?!" + args.role);
    }

    this.respawnTTL = null;
};

addToSpawnQueueEnd = function(roomName, args) {
    if (Game.rooms[roomName]) {
        Game.rooms[roomName].addToSpawnQueueEnd(args);
    }
};

addToSpawnQueueStart = function(roomName, args) {
    if (Game.rooms[roomName]) {
        Game.rooms[roomName].addToSpawnQueueStart(args);
    }
};

// ~~~~~~~~~~~~~~~~~~
// ~~ Small Helpers ~~
// ~~~~~~~~~~~~~~~~~~

Creep.prototype._withdrawEnergy = function(storage, taskWhenFinished) {
    this.say(creepTalk.withdrawEnergy, true);
    const result = this.withdraw(storage, RESOURCE_ENERGY);
    switch (result) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(storage, {maxRooms: 1});
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.taskTargetId = undefined;
            break;
        default:
            this.logActionError("Collecting Energy", result);
            break;
    }

    return result;
};

Creep.prototype._withdrawResource = function(storage, taskWhenFinished) {
    this.say(creepTalk.withdrawResource, true);

    switch (this.withdraw(storage, this.hauledResourceType)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(storage, {maxRooms: 1});
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.taskTargetId = undefined;
            break;
        default:
            this.logActionError("Withdrawing " + this.hauledResourceType,
                                this.withdraw(storage, this.hauledResourceType));
            break;
    }
};

Creep.prototype._pickupEnergy = function(pickup, taskWhenFinished, onlyPickupThisOne) {
    this.say(creepTalk.pickupResource, true);
    switch (this.pickup(pickup)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity || onlyPickupThisOne) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(pickup, {maxRooms: 1});
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
