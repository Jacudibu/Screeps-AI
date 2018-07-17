const roles = require('roles');

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
            this.spawnWorker(spawn, roles.HARVESTER);
        } else if (this.areUpgradersNeeded()) {
            this.spawnWorker(spawn, roles.UPGRADER);
        } else if (this.areBuildersNeeded()) {
            this.spawnWorker(spawn, roles.BUILDER);
        }
    },

    areHarvestersNeeded: function() {
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === roles.HARVESTER);
        return harvesters.length < HARVESTERS_DESIRED;
    },

    areUpgradersNeeded: function() {
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === roles.UPGRADER);
        return upgraders.length < UPGRADERS_DESIRED;
    },

    areBuildersNeeded: function() {
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role === roles.BUILDER);
        return builders.length < BUILDERS_DESIRED;
    },

    spawnWorker: function(spawn, role) {
        let newName = role + ' ' + Game.time;
        spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {memory: {role: role}});
    },

};

module.exports = spawnlogic;