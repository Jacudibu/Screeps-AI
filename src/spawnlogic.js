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
            this.spawnWorker(spawn, ROLE.HARVESTER);
        } else if (this.areUpgradersNeeded()) {
            this.spawnWorker(spawn, ROLE.UPGRADER);
        } else if (this.areBuildersNeeded()) {
            this.spawnWorker(spawn, ROLE.BUILDER);
        }
    },

    areHarvestersNeeded: function() {
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === ROLE.HARVESTER);
        return harvesters.length < HARVESTERS_DESIRED;
    },

    areUpgradersNeeded: function() {
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === ROLE.UPGRADER);
        return upgraders.length < UPGRADERS_DESIRED;
    },

    areBuildersNeeded: function() {
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role === ROLE.BUILDER);
        return builders.length < BUILDERS_DESIRED;
    },

    spawnWorker: function(spawn, role) {
        let newName = role + ' ' + Game.time;
        let currentTier = Math.floor(spawn.room.energyCapacityAvailable / COST_PER_WORKER_TIER);
        let body = [];

        for (let i = 0; i < currentTier; i++) {
            body.push(WORK, CARRY, MOVE);
        }

        let subtier = spawn.room.energyCapacityAvailable % COST_PER_WORKER_TIER;

        if (subtier >= 150) {
            body.push(MOVE);
        }
        if (subtier >= 100) {
            body.push(CARRY);
        }
        if (subtier >= 50) {
            body.push(MOVE);
        }

        body.sort();

        switch (spawn.spawnCreep(body, newName, {memory: {role: role, tier: currentTier}})) {
            case OK:
                spawn.room.memory.allowEnergyCollection = true;
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                spawn.room.memory.allowEnergyCollection = false;
                break;
            default:
                console.log("unexpected error when spawning creep: " + spawn.spawnCreep(body, newName, {memory: {role: role, tier: currentTier}}));
                spawn.room.memory.allowEnergyCollection = true;
                break;
        }
    },

};

module.exports = spawnlogic;