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

        if (!spawn.room.requestedCreeps) {
            this.initSpawnMemory(spawn.room);
        }

        if (this.isRoleNeeded(spawn.room, ROLE.HARVESTER)) {
            this.spawnWorker(spawn, ROLE.HARVESTER, true);
        } else if (this.isRoleNeeded(spawn.room, ROLE.UPGRADER)) {
            this.spawnWorker(spawn, ROLE.UPGRADER, true);
        } else if (this.isRoleNeeded(spawn.room, ROLE.BUILDER)) {
            this.spawnWorker(spawn, ROLE.BUILDER, true);
        } else {
            this.spawnWorker(spawn, ROLE.UPGRADER, false);
        }
    },

    isRoleNeeded: function(room, role) {
        let creepsWithRoleCount = this.countNumberOfCreepsWithRole(role);
        return creepsWithRoleCount < room.memory.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(role) {
        return _.sum(Game.creeps, creep => creep.memory.role === role);
    },

    spawnWorker: function(spawn, role, blockSpawningIfNoRessources) {
        let newName = role + ' ' + Game.time;
        let currentTier = Math.floor(spawn.room.energyCapacityAvailable / COST_PER_WORKER_TIER);
        let body = [];

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
        room.memory.requestedCreeps = {};
        room.memory.requestedCreeps[ROLE.HARVESTER] = 9;
        room.memory.requestedCreeps[ROLE.UPGRADER] = 1;
        room.memory.requestedCreeps[ROLE.BUILDER] = 1;
    },

};

module.exports = spawnlogic;