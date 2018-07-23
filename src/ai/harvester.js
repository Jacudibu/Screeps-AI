const harvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_ENERGY:
                creep.harvestEnergy();
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoContainer(TASK.HARVEST_ENERGY);
                break;
            case TASK.HARVEST_ENERGY_FETCH:
                creep.harvestEnergyAndFetch(TASK.STORE_ENERGY);
                break;
            case TASK.STORE_ENERGY:
                creep.storeEnergy(TASK.HARVEST_ENERGY_FETCH);
                break;
            default:
                creep.determineHarvesterStartTask(TASK.HARVEST_ENERGY);
                break;
        }
    },
};

module.exports = harvester;