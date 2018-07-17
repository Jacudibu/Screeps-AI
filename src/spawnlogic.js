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
        spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {memory: {role: role}});
    },

};

module.exports = spawnlogic;