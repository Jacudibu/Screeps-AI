const builderAI             = require('ai.builder');
const harvesterAI           = require('ai.harvester');
const haulerAI              = require('ai.hauler');
const upgraderAI            = require('ai.upgrader');
const repairerAI            = require('ai.repairer');
const mineralHarvesterAI    = require('ai.mineralharvester');
const remoteWorkerAI        = require('ai.remoteworker');
const remoteHaulerAI        = require('ai.remotehauler');
const remoteHarvesterAI     = require('ai.remoteharvester');
const remoteRepairerAI      = require('ai.remoterepairer');
const remoteUpgraderAI      = require('ai.remoteupgrader');
const reserverAI            = require('ai.reserver');
const attackerAI            = require('ai.attacker');
const claimerAI             = require('ai.claimer');
const claimerAttackerAI     = require('ai.claimerattacker');
const dismantlerAI          = require('ai.dismantler');
const defenderAI            = require('ai.defender');
const carrierAI             = require('ai.carrier');

const creepAi = {
    run: function() {
        for (let name in Game.creeps) {
            // noinspection JSUnfilteredForInLoop
            let creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            if (creep.memory.respawnTTL) {
                if (creep.ticksToLive < creep.memory.respawnTTL) {
                    creep.addRespawnEntryToSpawnQueue();
                    // console.log(creep.room + "|" + creep.name + " - respawn in " + creep.memory.spawnRoom + " registered.");
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
                    case ROLE.MINERAL_HARVESTER:
                        mineralHarvesterAI.run(creep);
                        break;
                    case ROLE.REMOTE_WORKER:
                        remoteWorkerAI.run(creep);
                        break;
                    case ROLE.REMOTE_HAULER:
                        remoteHaulerAI.run(creep);
                        break;
                    case ROLE.REMOTE_HARVESTER:
                        remoteHarvesterAI.run(creep);
                        break;
                    case ROLE.REMOTE_REPAIRER:
                        remoteRepairerAI.run(creep);
                        break;
                    case ROLE.REMOTE_UPGRADER:
                        remoteUpgraderAI.run(creep);
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
                    case ROLE.CARRIER:
                        carrierAI.run(creep);
                        break;
                    case ROLE.CLAIMER_ATTACKER:
                        claimerAttackerAI.run(creep);
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