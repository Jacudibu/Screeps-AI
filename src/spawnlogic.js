const jobs = require('roles_jobs');

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
            this.spawnWorker(spawn, jobs.STORE_ENERGY);
        } else if (this.areUpgradersNeeded()) {
            this.spawnWorker(spawn, jobs.UPGRADE_CONTROLLER);
        } else if (this.areBuildersNeeded()) {
            this.spawnWorker(spawn, jobs.BUILD_STRUCTURE);
        }
    },

    areHarvestersNeeded: function() {
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.priority === jobs.STORE_ENERGY);
        return harvesters.length < HARVESTERS_DESIRED;
    },

    areUpgradersNeeded: function() {
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.priority === jobs.UPGRADE_CONTROLLER);
        return upgraders.length < UPGRADERS_DESIRED;
    },

    areBuildersNeeded: function() {
        let builders = _.filter(Game.creeps, (creep) => creep.memory.priority === jobs.BUILD_STRUCTURE);
        return builders.length < BUILDERS_DESIRED;
    },

    spawnWorker: function(spawn, priority) {
        let newName = 'Drone ' + Game.time;
        spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {memory: {role: 'worker', job: 'idle', priority: priority}});
    },

};

module.exports = spawnlogic;