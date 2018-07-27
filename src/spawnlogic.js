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
            if (room.isSpawnQueueEmpty()) {
                if (room.energyCapacityAvailable === room.energyAvailable) {
                    // room.memory.autoSpawnTimer = room.memory.autoSpawnTimer - 1;

                    // TODO/HACK : This is a workaround as long as spawn Queue does not support args
                    this.checkRemoteMiningRoomSpawns(room, spawns[0]);
                }
            } else {
                room.memory.autoSpawnTimer = AUTO_SPAWN_TIMER;
                if (this.areThereEnoughResourcesToSpawnRole(room, this.peekFirstElementFromSpawnQueue(room))) {
                    this.spawnNewCreepWithRole(spawns, this.shiftElementFromSpawnQueue(room));
                }
            }

            room.memory.allowEnergyCollection = false; // room.isSpawnQueueEmpty();
        }
    },

    tryAddingNewCreepToSpawnQueue: function(room) {
        if (room.memory.requestedCreeps === undefined) {
            room.initSpawnMemory(room);
        }

        if (this.countNumberOfCreepsWithRole(room, ROLE.HARVESTER) > 0 && this.countNumberOfCreepsWithRole(room, ROLE.HAULER) === 0) {
            if (this.isRoleNeeded(room, ROLE.HAULER)) {
                room.addToSpawnQueue(ROLE.HAULER);
                return;
            }
        }

        if (this.isRoleNeeded(room, ROLE.HARVESTER)) {
            room.addToSpawnQueue(ROLE.HARVESTER);
            return;
        }

        if (this.isRoleNeeded(room, ROLE.HAULER)) {
            room.addToSpawnQueue(ROLE.HAULER);
            return;
        }

        if (this.isRoleNeeded(room, ROLE.UPGRADER)) {
            room.addToSpawnQueue(ROLE.UPGRADER);
            return;
        }

        if (this.isRoleNeeded(room, ROLE.BUILDER) && room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            room.addToSpawnQueue(ROLE.BUILDER);
            return;
        }

        if (this.isRoleNeeded(room, ROLE.REPAIRER)) {
            room.addToSpawnQueue(ROLE.REPAIRER);
            return;
        }

        if (room.memory.autoSpawnEnabled && room.memory.autoSpawnTimer === 0) {
            room.addToSpawnQueue(ROLE.UPGRADER);
            room.memory.autoSpawnTimer = AUTO_SPAWN_TIMER;
            return;
        }
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

    spawnNewCreepWithRole: function(spawns, role) {
        for(let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];
            if (spawn.spawning) {
                continue;
            }

            this.spawnRole(spawn, role);
            return;
        }
    },

    spawnRole: function(spawn, role) {
        const energy = spawn.room.energyCapacityAvailable;

        switch (role) {
            case ROLE.BUILDER:
                spawn.spawnWorker(role, energy, true);
                break;
            case ROLE.HARVESTER:
                spawn.spawnHarvester(energy, true);
                break;
            case ROLE.HAULER:
                spawn.spawnHauler(energy, true);
                break;
            case ROLE.UPGRADER:
                spawn.spawnUpgrader(energy, true);
                break;
            case ROLE.REPAIRER:
                spawn.spawnWorker(role, energy, true);
                break;
            default:
                console.log("Unknown role requested to spawn: " + role);
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

    checkRemoteMiningRoomSpawns(room, spawn) {
        let remoteMiningRooms = room.memory.remoteMiningRooms;

        if (!remoteMiningRooms || remoteMiningRooms.length === 0) {
            return;
        }

        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];

            if (remoteMiningRoom.assignedRemoteWorkers < Object.keys(remoteMiningRoom.sources).length) {
                spawn.spawnRemoteWorker(600, true, remoteMiningRooms[i]);
                Memory.rooms[remoteMiningRooms[i]].assignedRemoteWorkers++;
                return;
            }

            if (remoteMiningRoom.isHaulerRequired) {
                spawn.spawnRemoteHauler(room.energyAvailable, true, remoteMiningRooms[i]);
                Memory.rooms[remoteMiningRooms[i]].isHaulerRequired = false;
                return;
            }
        }

        spawn.spawnAnnoyer(room.energyAvailable, 'E57S48');
    },
};

module.exports = spawnlogic;