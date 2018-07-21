const spawnlogic = {
    run: function() {
        for (const i in Game.spawns) {
            this.spawnCreepsIfNeeded(Game.spawns[i]);
        }
    },

    spawnCreepsIfNeeded: function(spawn) {
        if (spawn.spawning) {
            spawn.room.visual.text('🛠️' + spawn.spawning.name, spawn.pos.x + 1, spawn.pos.y,
                {align: 'left', opacity: '0.5'});
            return;
        }

        const room = spawn.room;

        if (room.memory.requestedCreeps === undefined) {
            this.initSpawnMemory(spawn.room);
        }

        let currentTier = Math.floor(room.energyCapacityAvailable / COST_PER_WORKER_TIER);
        if (currentTier > room.memory.currentTier) {
            this.increaseTier(room, currentTier);
        }

        if (this.isRoleNeeded(room, ROLE.HARVESTER, currentTier)) {
            this.spawnHarvester(spawn, true, currentTier);
        } else if (this.isRoleNeeded(room, ROLE.UPGRADER)) {
            this.spawnWorker(spawn, ROLE.UPGRADER, true, currentTier);
        } else if (this.isRoleNeeded(room, ROLE.BUILDER)) {
            this.spawnWorker(spawn, ROLE.BUILDER, true, currentTier);
        } else if (this.isRoleNeeded(room, ROLE.REPAIRER)) {
            this.spawnWorker(spawn, ROLE.REPAIRER, true, currentTier);
        } else if (this.isRoleNeeded(room, ROLE.HAULER)) {
            this.spawnHauler(spawn, true, currentTier);
        } else if (room.energyCapacityAvailable === room.energyAvailable) {
            if (spawn.memory.nextAutoSpawn) {
                if (spawn.memory.nextAutoSpawn === Game.time) {
                    this.spawnWorker(spawn, ROLE.UPGRADER, false, currentTier);
                }
                else if (spawn.memory.nextAutoSpawn < Game.time) {
                    spawn.memory.nextAutoSpawn = Game.time + AUTO_SPAWN_TIMER;
                }
            } else {
                spawn.memory.nextAutoSpawn = Game.time + AUTO_SPAWN_TIMER;
            }
        }
    },

    isRoleNeeded: function(room, role) {
        let creepsWithRoleCount = this.countNumberOfCreepsWithRole(role);
        return creepsWithRoleCount < room.memory.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(role) {
        return _.sum(Game.creeps, creep => creep.memory.role === role);
    },

    spawnWorker: function(spawn, role, blockSpawningIfNoRessources, currentTier) {
        let body = [];

        if (currentTier > 22) {
            currentTier = 22;
        }

        for (let i = 0; i < currentTier; i++) {
            body.push(WORK, CARRY, MOVE);
        }

        let remaining = spawn.room.energyCapacityAvailable % COST_PER_WORKER_TIER;

        if (remaining >= 100) {
            body.push(CARRY);
        }
        if (remaining >= 50) {
            body.push(MOVE);
        }

        body.sort();

        this.spawnCreep(spawn, role, blockSpawningIfNoRessources, body, {memory: {role: role, tier: currentTier}});
    },

    spawnHauler: function(spawn, blockSpawningIfNoResources, currentTier) {
        let body = [];

        if (currentTier > 25) {
            currentTier = 25;
        }

        let energy = spawn.room.energyAvailable;

        if (energy > 5000) {
            energy = 5000;
        }

        while(energy > 100) {
            body.push(CARRY, MOVE);
            energy -= 100;
        }

        body.sort();

        this.spawnCreep(spawn, ROLE.HAULER, blockSpawningIfNoResources, body, {memory: {role: ROLE.HAULER, tier: currentTier}});
    },

    spawnHarvester: function(spawn, blockSpawningIfNoResources, currentTier) {
        let body = [];

        let energy = spawn.room.energyAvailable;

        if (energy > 650) {
            energy = 650;
        }

        body.push(MOVE);
        energy -= 50;

        while (energy > 100) {
            body.push(WORK);
            energy -= BODYPART_COST.work;
        }

        body.sort();

        this.spawnCreep(spawn, ROLE.STRIP_HARVESTER, blockSpawningIfNoResources, body, {memory: {role: ROLE.STRIP_HARVESTER, tier: currentTier}});
    },

    spawnCreep: function(spawn, role, blockSpawningIfNoResources, body, memory) {
        let name = role + '#' + Memory.creepsBuilt;

        switch (spawn.spawnCreep(body, name, memory)) {
            case OK:
                spawn.room.memory.allowEnergyCollection = true;
                Memory.creepsBuilt = Memory.creepsBuilt + 1;
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                if (blockSpawningIfNoResources) {
                    spawn.room.memory.allowEnergyCollection = false;
                }
                break;
            default:
                console.log("unexpected error when spawning creep: " + spawn.spawnCreep(body, name, memory)
                    + "\nBody: " + body + " name:" + name + "memory:" + memory);
                spawn.room.memory.allowEnergyCollection = true;
                break;
        }
    },

    initSpawnMemory: function(room) {
        room.memory.currentTier = 1;

        room.memory.requestedCreeps = {};
        room.memory.requestedCreeps[ROLE.HARVESTER] = 9;
        room.memory.requestedCreeps[ROLE.UPGRADER] = 1;
        room.memory.requestedCreeps[ROLE.BUILDER] = 1;
        room.memory.requestedCreeps[ROLE.REPAIRER] = 1;
    },

    increaseTier: function(room, currentTier) {
        room.memory.currentTier = currentTier;

        if (currentTier < 3 || currentTier > 8) {
            return;
        }

        let harvestersNeeded = Math.floor(room.memory.requestedCreeps[ROLE.HARVESTER] * 0.75);
        harvestersNeeded = Math.max(harvestersNeeded, room.find(FIND_SOURCES).length);
        room.memory.requestedCreeps[ROLE.HARVESTER] = harvestersNeeded;

        for (let sourceName in room.memory.sources) {
            if (room.memory.sources[sourceName].workersMax > 0) {
                room.memory.sources[sourceName].workersMax = Math.max(Math.floor(room.memory.sources[sourceName].workersMax * 0.75), 1);
            }
        }
    },
};

module.exports = spawnlogic;