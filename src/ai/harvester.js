const harvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_ENERGY:
                creep.harvestEnergy(TASK.STORE_ENERGY);
                break;
            case TASK.STORE_ENERGY:
                creep.storeEnergy(TASK.HARVEST_ENERGY);
                break;
            case TASK.RENEW_CREEP:
                creep.renew(TASK.HARVEST_ENERGY);
                break;
            default:
                creep.setTask(TASK.HARVEST_ENERGY);
                break;
        }
    },
};

module.exports = harvester;