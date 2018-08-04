const spawnlogic = {
    run: function() {
        for (const i in Game.rooms) {
            let room = Game.rooms[i];

            const spawns = Game.rooms[i].find(FIND_MY_SPAWNS);
            if (spawns.length === 0) {
                continue;
            }

            let allSpawnsBusy = true;
            for(let i = 0; i < spawns.length; i++) {
                let spawn = spawns[i];
                if (spawn.spawning) {
                    spawn.drawSpawnInfo();
                } else {
                    allSpawnsBusy = false;
                }
            }

            if (allSpawnsBusy) {
                continue;
            }

            if (room.isSpawnQueueEmpty()) {
                this.tryAddingNewCreepToSpawnQueue(room);
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

    tryAddingNewCreepToSpawnQueue: function(room) {
        if (room.memory.requestedCreeps === undefined) {
            room.initSpawnMemory(room);
        }

        if (this.countNumberOfCreepsWithRole(room, ROLE.HARVESTER) > 0 && this.countNumberOfCreepsWithRole(room, ROLE.HAULER) === 0) {
            if (this.isRoleNeeded(room, ROLE.HAULER)) {
                room.addToSpawnQueueStart({role: ROLE.HAULER});
                return;
            }
        }

        if (this.isRoleNeeded(room, ROLE.HARVESTER)) {
            room.addToSpawnQueueStart({role: ROLE.HARVESTER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.HAULER)) {
            room.addToSpawnQueueEnd({role: ROLE.HAULER});
            return;
        }

        if (room.memory.requiresHelp) {
            room.memory.requiresHelp = false;
            room.addToSpawnQueueEnd({role: ROLE.DEFENDER, targetRoomName: room.name});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.UPGRADER)) {
            room.addToSpawnQueueEnd({role: ROLE.UPGRADER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.BUILDER) && room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            room.addToSpawnQueueEnd({role: ROLE.BUILDER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.REPAIRER)) {
            room.addToSpawnQueueEnd({role: ROLE.REPAIRER});
            return;
        }

        if (room.memory.autoSpawnEnabled && room.memory.autoSpawnTimer === 0) {
            room.addToSpawnQueueEnd({role: ROLE.UPGRADER});
            room.memory.autoSpawnTimer = AUTO_SPAWN_TIMER;
            return;
        }

        this.checkRemoteMiningRooms(room);
    },

    areThereEnoughResourcesToSpawnRole: function(room, role) {
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
                return spawn.spawnRemoteWorker(energy, args.targetRoomName);
            case ROLE.REMOTE_HAULER:
                return spawn.spawnRemoteHauler(energy, args.targetRoomName);
            case ROLE.RESERVER:
                return spawn.spawnReserver(energy, args.targetRoomName);
            case ROLE.ATTACKER:
                return spawn.spawnDefender(energy, args.targetRoomName);
            case ROLE.DEFENDER:
                return spawn.spawnDefender(energy, args.targetRoomName);
            default:
                console.log("Unknown role requested to spawn: " + args.role);
                return OK; // so it doesn't clog up our spawn queue
        }
    },

    isRoleNeeded: function(room, role) {
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

        // Iterate defenders seperately
        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];
            if (remoteMiningRoom.requiresHelp === true) {
                room.addToSpawnQueueEnd({role: ROLE.DEFENDER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].requiresHelp = false;
            }
        }

        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];

            if (!remoteMiningRoom.sources) {
                Game.rooms[remoteMiningRooms[i]].initializeMemoryForAllSourcesInRoom();
            }

            if (remoteMiningRoom.assignedRemoteWorkers < Object.keys(remoteMiningRoom.sources).length) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_WORKER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].assignedRemoteWorkers++;
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
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];
            if (!remoteMiningRoom.isReserverAssigned && room.controller.level >= 4) {
                room.addToSpawnQueueEnd({role: ROLE.RESERVER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].isReserverAssigned = true;
                return;
            }
        }
    },
};

module.exports = spawnlogic;