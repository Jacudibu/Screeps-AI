const ai = {
    [ROLE.ATTACKER]:                require('ai.attacker'),
    [ROLE.BUILDER]:                 require('ai.builder'),
    [ROLE.CARRIER]:                 require('ai.carrier'),
    [ROLE.CLAIMER]:                 require('ai.claimer'),
    [ROLE.CLAIMER_ATTACKER]:        require('ai.claimerattacker'),
    [ROLE.DEFENDER]:                require('ai.defender'),
    [ROLE.DISMANTLER]:              require('ai.dismantler'),
    [ROLE.EARLY_RCL_HARVESTER]:     require('ai.earlyrclharvester'),
    [ROLE.GUIDED_RANGED_ATTACKER]:  require('ai.guidedrangedattacker'),
    [ROLE.HARVESTER]:               require('ai.harvester'),
    [ROLE.HAULER]:                  require('ai.hauler'),
    [ROLE.HEALER]:                  require('ai.healer'),
    [ROLE.MINERAL_HARVESTER]:       require('ai.mineralharvester'),
    [ROLE.REMOTE_WORKER]:           require('ai.remoteworker'),
    [ROLE.REMOTE_HAULER]:           require('ai.remotehauler'),
    [ROLE.REMOTE_HARVESTER]:        require('ai.remoteharvester'),
    [ROLE.REMOTE_REPAIRER]:         require('ai.remoterepairer'),
    [ROLE.REMOTE_UPGRADER]:         require('ai.remoteupgrader'),
    [ROLE.RESERVER]:                require('ai.reserver'),
    [ROLE.RANGED_ATTACKER]:         require('ai.rangedattacker'),
    [ROLE.RANGED_DEFENDER]:         require('ai.rangeddefender'),
    [ROLE.REPAIRER]:                require('ai.repairer'),
    [ROLE.SCOUT]:                   require('ai.scout'),
    [ROLE.SCOUT_WITH_ATTACK_PART]:  require('ai.scoutwithattackpart'),
    [ROLE.UPGRADER]:                require('ai.upgrader'),
};

const creepAi = {
    run() {
        for (let name in Game.creeps) {
            // noinspection JSUnfilteredForInLoop
            let creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            this._tryRunCreepLogic(creep);
        }

        this._tryMoveAllCreeps();
    },

    _tryMoveAllCreeps() {
        try {
            moveCache.moveAllCreeps();
        } catch (e) {
            let message = " moveCache.moveAllCreeps -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _tryRunCreepLogic(creep) {
        try {
            this._runCreepLogic(creep);
        } catch (e) {
            let message = creep + " -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _runCreepLogic: function(creep) {
        if (creep.respawnTTL) {
            if (creep.ticksToLive < creep.respawnTTL) {
                creep.addRespawnEntryToSpawnQueue();
            }
        }

        ai[creep.role].run(creep);
    },
};

profiler.registerObject(creepAi, "CreepAi");
module.exports = creepAi;