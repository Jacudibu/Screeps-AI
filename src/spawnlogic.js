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
                    room.memory.autoSpawnTimer = room.memory.autoSpawnTimer - 1;
                }
            } else {
                room.memory.autoSpawnTimer = AUTO_SPAWN_TIMER;
                if (this.areThereEnoughResourcesToSpawnRole(room, this.peekFirstElementFromSpawnQueue(room))) {
                    this.spawnNewCreepWithRole(spawns, this.shiftElementFromSpawnQueue(room));
                }
            }

            room.memory.allowEnergyCollection = room.isSpawnQueueEmpty();
        }
    },

    tryAddingNewCreepToSpawnQueue: function(room) {
        if (room.memory.requestedCreeps === undefined) {
            room.initSpawnMemory(room);
        }

        console.log(this.countNumberOfCreepsWithRole(ROLE.HARVESTER) + " <<<<< " + this.countNumberOfCreepsWithRole(ROLE.HAULER));
        if (this.countNumberOfCreepsWithRole(ROLE.HARVESTER) > 0 && this.countNumberOfCreepsWithRole(ROLE.HAULER) === 0) {
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

        if (room.memory.autoSpawnTimer === 0) {
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
                spawn.spawnWorker(role, energy, true);
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
        let creepsWithRoleCount = this.countNumberOfCreepsWithRole(role);
        return creepsWithRoleCount < room.memory.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(role) {
        return _.sum(Game.creeps, creep => creep.memory.role === role);
    },


};

module.exports = spawnlogic;