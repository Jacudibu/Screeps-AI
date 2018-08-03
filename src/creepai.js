const builderAI = require('ai_builder');
const harvesterAI = require('ai_harvester');
const haulerAI = require('ai_hauler');
const upgraderAI = require('ai_upgrader');
const repairerAI = require('ai_repairer');
const remoteWorkerAI = require('ai_remoteworker');
const remoteHaulerAI = require('ai_remotehauler');
const reserverAI = require('ai_reserver');
const attackerAI = require('ai_attacker');
const claimerAI = require('ai_claimer');
const dismantlerAI = require('ai_dismantler');
const defenderAI = require('ai_defender');

const creepAi = {
    run: function() {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            if (creep.memory.respawnTime) {
                if (Game.time >= creep.memory.respawnTime) {
                    creep.addRespawnEntryToSpawnQueue();
                }
            }

            try {
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
                    case ROLE.HAULER:
                        haulerAI.run(creep);
                        break;
                    case ROLE.REMOTE_WORKER:
                        remoteWorkerAI.run(creep);
                        break;
                    case ROLE.REMOTE_HAULER:
                        remoteHaulerAI.run(creep);
                        break;
                    case ROLE.ATTACKER:
                        attackerAI.run(creep);
                        break;
                    case ROLE.CLAIMER:
                        claimerAI.run(creep);
                        break;
                    case ROLE.RESERVER:
                        reserverAI.run(creep);
                        break;
                    case ROLE.DISMANTLER:
                        dismantlerAI.run(creep);
                        break;
                    case ROLE.DEFENDER:
                        defenderAI.run(creep);
                        break;
                }
            } catch (e) {
                let message = creep.room.name + "|" + creep.name + " -> caught error: " + e;
                if (e.stack) {
                    message += "\nTrace:\n" + e.stack;
                }
                console.log(message);
                Game.notify(message, 5);
            }
        }
    }
};

module.exports = creepAi;