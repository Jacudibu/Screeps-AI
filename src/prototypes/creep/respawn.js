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
            if (this.room.energyCapacityAvailable >= 500) {
                // Room is mature enough to survive on its own
                break;
            }

            const constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
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

            if (Game.rooms[args.targetRoomName]) {
                const terminal = Game.rooms[args.targetRoomName].terminal;
                if (terminal && terminal.my)
                {
                    args.role = ROLE.REMOTE_UPGRADER;
                }
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