const roles = require('roles');

const builderAI = require('ai_builder');
const harvesterAI = require('ai_harvester');
const upgraderAI = require('ai_upgrader');

const creepAi = {
    run: function() {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            switch (creep.memory.role) {
                case roles.HARVESTER:
                    harvesterAI.run(creep);
                    break;
                case roles.BUILDER:
                    builderAI.run(creep);
                    break;
                case roles.UPGRADER:
                    upgraderAI.run(creep);
                    break;
            }
        }
    }
};

module.exports = creepAi;