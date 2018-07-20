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
            room.memory.currentTier = currentTier;

            if (currentTier > 2) { // don't do it on the first tier upgrade since we (probably) are unable to 100% farm the resource yet
                let harvestersNeeded = Math.ceil(room.memory.requestedCreeps[ROLE.HARVESTER] * 0.5);
                harvestersNeeded = Math.max(harvestersNeeded, room.find(FIND_SOURCES).length);
                room.memory.requestedCreeps[ROLE.HARVESTER] = harvestersNeeded;
            }
        }

        if (this.isRoleNeeded(room, ROLE.HARVESTER, currentTier)) {
            this.spawnWorker(spawn, ROLE.HARVESTER, true, currentTier);
        } else if (this.isRoleNeeded(room, ROLE.UPGRADER)) {
            this.spawnWorker(spawn, ROLE.UPGRADER, true, currentTier);
        } else if (this.isRoleNeeded(room, ROLE.BUILDER)) {
            this.spawnWorker(spawn, ROLE.BUILDER, true, currentTier);
        } else if (room.energyCapacityAvailable === room.energyAvailable) {
            if (spawn.memory.nextAutoSpawn) {
                if (spawn.memory.nextAutoSpawn === Game.time) {
                    if (spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                        this.spawnWorker(spawn, ROLE.BUILDER, false, currentTier);
                    }
                    else {
                        this.spawnWorker(spawn, ROLE.UPGRADER, false, currentTier);
                    }
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
        let newName = role + ' ' + Game.time;
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

        switch (spawn.spawnCreep(body, newName, {memory: {role: role, tier: currentTier}})) {
            case OK:
                spawn.room.memory.allowEnergyCollection = true;
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                if (blockSpawningIfNoRessources) {
                    spawn.room.memory.allowEnergyCollection = false;
                }
                break;
            default:
                console.log("unexpected error when spawning creep: " + spawn.spawnCreep(body, newName, {memory: {role: role, tier: currentTier}}));
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
    },

};

module.exports = spawnlogic;