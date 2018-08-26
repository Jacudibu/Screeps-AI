const spawnlogic = {
    run: function() {
        for (const i in Game.rooms) {
            let room = Game.rooms[i];

            const spawns = room.mySpawns;
            if (spawns.length === 0) {
                continue;
            }

            let allSpawnsBusy = true;
            for(let i = 0; i < spawns.length; i++) {
                let spawn = spawns[i];
                if (spawn && spawn.spawning) {
                    spawn.drawSpawnInfo();
                } else {
                    allSpawnsBusy = false;
                }
            }

            if (allSpawnsBusy) {
                continue;
            }

            if (room.isSpawnQueueEmpty()) {
                this.tryAddingNewCreepToSpawnQueue(room, spawns);
            } else {
                this.checkAndSpawnDefenderIfNecessary(room);
                this.checkRemoteMiningRoomsAndSpawnDefenderIfNecessary(room);
            }

            // If something was added the spawnqueue was changed
            if (!room.isSpawnQueueEmpty()) {
                room.memory.autoSpawnTimer = AUTO_SPAWN_TIMER;
                if (this.searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, this.peekFirstElementFromSpawnQueue(room)) === OK) {
                    this.shiftElementFromSpawnQueue(room);
                }
            }

            room.memory.allowEnergyCollection = room.isSpawnQueueEmpty() && !room.storage;
        }
    },

    checkAndSpawnDefenderIfNecessary: function(room) {
        if (room.memory.requiresHelp) {
            room.memory.requiresHelp = false;
            room.addToSpawnQueueStart({role: ROLE.DEFENDER, targetRoomName: room.name});
            return true;
        }

        return false;
    },

    tryAddingNewCreepToSpawnQueue: function(room, spawns) {
        if (room.memory.requestedCreeps === undefined) {
            room.initSpawnMemory(room);
        }

        if (this.countNumberOfCreepsWithRole(room, ROLE.HARVESTER) > 0 && this.countNumberOfCreepsWithRole(room, ROLE.HAULER) === 0) {
            if (this.isRoleNeeded(room, spawns, ROLE.HAULER)) {
                room.addToSpawnQueueStart({role: ROLE.HAULER});
                return;
            }
        }

        if (this.isRoleNeeded(room, spawns, ROLE.HARVESTER)) {
            room.addToSpawnQueueStart({role: ROLE.HARVESTER});
            return;
        }

        if (this.isRoleNeeded(room, spawns, ROLE.HAULER)) {
            room.addToSpawnQueueEnd({role: ROLE.HAULER});
            return;
        }

        if (this.checkAndSpawnDefenderIfNecessary(room)) {
            return;
        }

        if (this.isRoleNeeded(room, spawns, ROLE.UPGRADER)) {
            room.addToSpawnQueueEnd({role: ROLE.UPGRADER});
            return;
        }

        if (this.isRoleNeeded(room, spawns, ROLE.BUILDER) && room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            room.addToSpawnQueueEnd({role: ROLE.BUILDER});
            return;
        }

        if (this.isRoleNeeded(room, spawns, ROLE.REPAIRER)) {
            room.addToSpawnQueueEnd({role: ROLE.REPAIRER});
            return;
        }

        if (room.extractor && room.mineral &&room.mineral.mineralAmount > 1000 && !room.memory.isMineralHarvesterAssigned && room.controller.level >= 6) {
            room.addToSpawnQueueEnd({role: ROLE.MINERAL_HARVESTER});
            room.memory.isMineralHarvesterAssigned = true;
            return;
        }

        if (room.memory.autoSpawnEnabled && room.memory.autoSpawnTimer === 0) {
            room.addToSpawnQueueEnd({role: ROLE.UPGRADER});
            room.memory.autoSpawnTimer = AUTO_SPAWN_TIMER;
            return;
        }

        this.checkRemoteMiningRooms(room);
    },

    areThereEnoughResourcesToSpawnRole: function(room) {
        return room.energyCapacityAvailable === room.energyAvailable;
    },

    shiftElementFromSpawnQueue: function(room) {
        return room.memory.spawnQueue.shift();
    },

    peekFirstElementFromSpawnQueue: function(room) {
        return room.memory.spawnQueue[0];
    },

    searchUnoccupiedSpawnAndSpawnNewCreepWithArgs: function(spawns, args) {
        for(let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];
            if (spawn.spawning) {
                continue;
            }

            return this.spawnCreepWithArgs(spawn, args);
        }

        return ERR_BUSY;
    },

    spawnCreepWithArgs: function(spawn, args) {
        const energy = spawn.room.energyCapacityAvailable;

        switch (args.role) {
            case ROLE.BUILDER:
                return spawn.spawnWorker(args.role, energy);
            case ROLE.HARVESTER:
                return spawn.spawnHarvester(energy);
            case ROLE.HAULER:
                return spawn.spawnHauler(energy);
            case ROLE.UPGRADER:
                return spawn.spawnUpgrader(energy);
            case ROLE.REPAIRER:
                return spawn.spawnWorker(args.role, energy);
            case ROLE.REMOTE_WORKER:
                return spawn.spawnRemoteWorker(energy, args.targetRoomName, args.respawnTTL);
            case ROLE.REMOTE_HARVESTER:
                return spawn.spawnRemoteHarvester(energy, args.targetRoomName);
            case ROLE.REMOTE_HAULER:
                return spawn.spawnRemoteHauler(energy, args.targetRoomName);
            case ROLE.REMOTE_REPAIRER:
                return spawn.spawnRemoteRepairer(energy, args.targetRoomName, args.route);
            case ROLE.REMOTE_UPGRADER:
                return spawn.spawnRemoteUpgrader(energy, args.targetRoomName, args.respawnTTL);
            case ROLE.RESERVER:
                return spawn.spawnReserver(energy, args.targetRoomName);
            case ROLE.ATTACKER:
                return spawn.spawnDefender(energy, args.targetRoomName);
            case ROLE.DEFENDER:
                return spawn.spawnDefender(energy, args.targetRoomName);
            case ROLE.CARRIER:
                return spawn.spawnCarrier(energy, args.targetRoomName, args.storageRoomName, args.respawnTTL);
            case ROLE.MINERAL_HARVESTER:
                return spawn.spawnMineralHarvester(energy);
            default:
                console.log("Unknown role requested to spawn: " + args.role);
                return OK; // so it gets removed from our spawn queue
        }
    },

    isRoleNeeded: function(room, spawns, role) {
        // is said role already being spawned?
        for (let i = 0; i < spawns.length; i++) {
            if (spawns[i].spawning && Memory.creeps[spawns[i].spawning.name].role === role) {
                return false;
            }
        }

        // is said role already registered in spawnQueue?
        if (!room.memory.spawnQueue) {
            room.memory.spawnQueue = [];
        }

        for (let args of room.memory.spawnQueue) {
            console.log(args.role);
            if (args.role === role) {
                return false;
            }
        }

        let creepsWithRoleCount = this.countNumberOfCreepsWithRole(room, role);

        return creepsWithRoleCount < room.memory.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(room, role) {
        let creeps = room.find(FIND_MY_CREEPS);
        return _.sum(creeps, creep => creep.memory.role === role);
    },

    checkRemoteMiningRooms(room) {
        let remoteMiningRooms = room.memory.remoteMiningRooms;

        if (!remoteMiningRooms || remoteMiningRooms.length === 0) {
            return;
        }

        if (this.checkRemoteMiningRoomsAndSpawnDefenderIfNecessary(room)) {
            return;
        }

        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];

            if (!remoteMiningRoom.sources) {
                if (Game.rooms[remoteMiningRoom[i]]) {
                    Game.rooms[remoteMiningRooms[i]].initializeMemoryForAllSourcesInRoom();
                } else {
                    console.log(remoteMiningRoom[i] + "|no vision to set up remote mining room source memory");
                    continue;
                }
            }

            if (remoteMiningRoom.assignedHarvesters < Object.keys(remoteMiningRoom.sources).length) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_HARVESTER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].assignedHarvesters++;
                return;
            }

            if (remoteMiningRoom.assignedHaulers < remoteMiningRoom.requiredHaulers) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_HAULER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].assignedHaulers++;
                return;
            }
        }

        // Iterate reservers seperately
        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let otherRoom = Game.rooms[remoteMiningRooms[i]];

            if (otherRoom && otherRoom.controller.reservation && otherRoom.controller.reservation.ticksToEnd > 1000) {
                continue;
            }

            let remoteMiningRoomMemory = Memory.rooms[remoteMiningRooms[i]];
            if (!remoteMiningRoomMemory.isReserverAssigned && room.energyCapacityAvailable >= 650) {
                room.addToSpawnQueueEnd({role: ROLE.RESERVER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].isReserverAssigned = true;
                return;
            }
        }
    },

    checkRemoteMiningRoomsAndSpawnDefenderIfNecessary: function(room) {
        let remoteMiningRooms = room.memory.remoteMiningRooms;

        if (!remoteMiningRooms || remoteMiningRooms.length === 0) {
            return false;
        }

        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];
            if (remoteMiningRoom.requiresHelp === true) {
                room.addToSpawnQueueStart({role: ROLE.DEFENDER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].requiresHelp = false;
                return true;
            }
        }

        return false;
    },
};

module.exports = spawnlogic;