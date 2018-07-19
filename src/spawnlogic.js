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

        if (this.areHarvestersNeeded()) {
            this.spawnWorker(spawn, ROLE.HARVESTER, true);
        } else if (this.areUpgradersNeeded()) {
            this.spawnWorker(spawn, ROLE.UPGRADER, true);
        } else if (this.areBuildersNeeded()) {
            this.spawnWorker(spawn, ROLE.BUILDER, true);
        } else {
            this.spawnWorker(spawn, ROLE.UPGRADER, false);
        }
    },

    areHarvestersNeeded: function() {
        let harvesters = this.countNumberOfCreepsWithRole(ROLE.HARVESTER);
        return harvesters < HARVESTERS_DESIRED;
    },

    areUpgradersNeeded: function() {
        let upgraders = this.countNumberOfCreepsWithRole(ROLE.UPGRADER);
        return upgraders < UPGRADERS_DESIRED;
    },

    areBuildersNeeded: function() {
        let builders = this.countNumberOfCreepsWithRole(ROLE.BUILDER);
        return builders < BUILDERS_DESIRED;
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

};

module.exports = spawnlogic;