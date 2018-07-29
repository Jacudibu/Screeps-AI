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
                if (this.areThereEnoughResourcesToSpawnRole(room, this.peekFirstElementFromSpawnQueue(room))) {
                    this.searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, this.shiftElementFromSpawnQueue(room));
                }
            }

            room.memory.allowEnergyCollection = room.isSpawnQueueEmpty() && room.controller.level < 4;
        }
    },

    tryAddingNewCreepToSpawnQueue: function(room) {
        if (room.memory.requestedCreeps === undefined) {
            room.initSpawnMemory(room);
        }

        if (this.countNumberOfCreepsWithRole(room, ROLE.HARVESTER) > 0 && this.countNumberOfCreepsWithRole(room, ROLE.HAULER) === 0) {
            if (this.isRoleNeeded(room, ROLE.HAULER)) {
                room.addToSpawnQueue({role: ROLE.HAULER});
                return;
            }
        }

        if (this.isRoleNeeded(room, ROLE.HARVESTER)) {
            room.addToSpawnQueue({role: ROLE.HARVESTER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.HAULER)) {
            room.addToSpawnQueue({role: ROLE.HAULER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.UPGRADER)) {
            room.addToSpawnQueue({role: ROLE.UPGRADER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.BUILDER) && room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            room.addToSpawnQueue({role: ROLE.BUILDER});
            return;
        }

        if (this.isRoleNeeded(room, ROLE.REPAIRER)) {
            room.addToSpawnQueue({role: ROLE.REPAIRER});
            return;
        }

        if (room.memory.autoSpawnEnabled && room.memory.autoSpawnTimer === 0) {
            room.addToSpawnQueue({role: ROLE.UPGRADER});
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

            this.spawnCreepWithArgs(spawn, args);
            return;
        }
    },

    spawnCreepWithArgs: function(spawn, args) {
        const energy = spawn.room.energyCapacityAvailable;

        switch (args.role) {
            case ROLE.BUILDER:
                spawn.spawnWorker(args.role, energy);
                break;
            case ROLE.HARVESTER:
                spawn.spawnHarvester(energy);
                break;
            case ROLE.HAULER:
                spawn.spawnHauler(energy);
                break;
            case ROLE.UPGRADER:
                spawn.spawnUpgrader(energy);
                break;
            case ROLE.REPAIRER:
                spawn.spawnWorker(args.role, energy);
                break;
            case ROLE.REMOTE_WORKER:
                spawn.spawnRemoteWorker(energy, args.targetRoomName);
                break;
            case ROLE.REMOTE_HAULER:
                spawn.spawnRemoteHauler(energy, args.targetRoomName);
                break;
            case ROLE.RESERVER:
                spawn.spawnReserver(energy, args.targetRoomName);
                break;
            case ROLE.ATTACKER:
                spawn.spawnDefender(energy, args.targetRoomName);
                break;
            default:
                console.log("Unknown role requested to spawn: " + args.role);
                break;
        }
    },

    isRoleNeeded: function(room, role) {
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

        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];

            if (remoteMiningRoom.requiresHelp === true) {
                room.addToSpawnQueue({role: ROLE.ATTACKER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].requiresHelp = false;
            }

            if (!remoteMiningRoom.sources) {
                Game.rooms[remoteMiningRooms[i]].initializeMemoryForAllSourcesInRoom();
            }

            if (remoteMiningRoom.assignedRemoteWorkers < Object.keys(remoteMiningRoom.sources).length) {
                room.addToSpawnQueue({role: ROLE.REMOTE_WORKER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].assignedRemoteWorkers++;
                return;
            }

            if (remoteMiningRoom.assignedHaulers < remoteMiningRoom.requiredHaulers) {
                room.addToSpawnQueue({role: ROLE.REMOTE_HAULER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].assignedHaulers++;
                return;
            }
        }

        // Iterate reservers seperately
        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];
            if (!remoteMiningRoom.isReserverAssigned && room.controller.level >= 4) {
                room.addToSpawnQueue({role: ROLE.RESERVER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].isReserverAssigned = true;
                return;
            }
        }
    },
};

module.exports = spawnlogic;