const aiutils = require("ai_aiutils");

const upgrader = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.COLLECT_ENERGY:
                aiutils.collectEnergy(creep, TASK.UPGRADE_CONTROLLER);
                break;
            case TASK.UPGRADE_CONTROLLER:
                this.upgradeController(creep);
                break;
            case TASK.RENEW_CREEP:
                aiutils.renewCreep(creep, TASK.HARVEST_ENERGY);
                break;
            default:
                creep.memory.task = TASK.COLLECT_ENERGY;
                break;
        }
    },

    upgradeController: function(creep) {
        switch (creep.upgradeController(creep.room.controller)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(creep.room.controller);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                aiutils.setTaskRenewWhenNeededOr(creep, TASK.COLLECT_ENERGY);
                break;
            default:
                console.log("unexpected error when upgrading controller: " + creep.upgradeController(creep.room.controller));
                break;
        }
    },
};

module.exports = upgrader;