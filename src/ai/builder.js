const aiutils = require('ai_aiutils');
const upgrader = require('ai_upgrader');

const builder = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                aiutils.collectEnergy(creep, TASK.BUILD_STRUCTURE);
                break;
            case TASK.BUILD_STRUCTURE:
                this.buildStructures(creep);
                break;
            case TASK.REPAIR_STRUCTURE:
                this.repairStructures(creep);
                break;
            case TASK.UPGRADE_CONTROLLER:
                upgrader.upgradeController(creep);
                break;
            case TASK.RENEW_CREEP:
                aiutils.renewCreep(creep, TASK.COLLECT_ENERGY);
                break;
            default:
                creep.memory.task = TASK.COLLECT_ENERGY;
                break;
        }
    },

    getConstructionSite(creep) {
        if (creep.memory.taskTargetId) {
            return Game.getObjectById(creep.memory.taskTargetId);
        }

        let constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

        if (constructionSites.length === 0) {
            return ERR_NOT_FOUND;
        }

        creep.memory.taskTargetId = constructionSites[0].id;
        return constructionSites[0];
    },

    buildStructures: function (creep) {
        let constructionSite = this.getConstructionSite(creep);

        if (constructionSite === ERR_NOT_FOUND) {
            creep.say('No Build');
            creep.memory.task = TASK.REPAIR_STRUCTURE;
            this.repairStructures(creep);
            return;
        }

        switch (creep.build(constructionSite)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(constructionSite);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.taskTargetId = undefined;
                aiutils.setTaskRenewWhenNeededOr(creep, TASK.COLLECT_ENERGY);
                break;
            case ERR_INVALID_TARGET:
                creep.memory.taskTargetId = undefined;
                break;
            default:
                console.log("unexpected error when building object: " + creep.build(constructionSite));
                break;
        }
    },

    getDamagedStructure: function(creep) {
        if (creep.memory.taskTargetId) {
            return Game.getObjectById(creep.memory.taskTargetId);
        }

        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax
        });

        damagedStructures.sort((a,b) => a.hits - b.hits);

        if(damagedStructures.length === 0) {
            return ERR_NOT_FOUND;
        }

        creep.memory.taskTargetId = damagedStructures[0].id;
        return damagedStructures[0];
    },

    repairStructures: function (creep) {
        let damagedStructure = this.getDamagedStructure(creep);

        if (damagedStructure === ERR_NOT_FOUND) {
            creep.say('No Repair');
            creep.memory.task = TASK.UPGRADE_CONTROLLER;
            upgrader.upgradeController(creep);
            return;
        }

        switch (creep.repair(damagedStructure)) {
            case OK:
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.taskTargetId = undefined;
                aiutils.setTaskRenewWhenNeededOr(creep, TASK.COLLECT_ENERGY);
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(damagedStructure);
                break;
            default:
                console.log("unexpected error when repairing object: " + creep.repair(damagedStructure));
                break;
        }
    },
};

module.exports = builder;