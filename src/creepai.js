const builderAI = require('ai_builder');
const harvesterAI = require('ai_harvester');
const upgraderAI = require('ai_upgrader');
const repairerAI = require('ai_repairer');

const creepAi = {
    run: function() {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            switch (creep.memory.role) {
                case ROLE.HARVESTER:
                    harvesterAI.run(creep);
                    break;
                case ROLE.BUILDER:
                    builderAI.run(creep);
                    break;
                case ROLE.REPAIRER:
                    repairerAI.run(creep);
                    break;
                case ROLE.UPGRADER:
                    upgraderAI.run(creep);
                    break;
            }
        }
    }
};

module.exports = creepAi;