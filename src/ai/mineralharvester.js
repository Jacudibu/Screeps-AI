const mineralHarvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_MINERAL:
                creep.harvestMineral();
                break;
            default:
                creep.setTask(TASK.HARVEST_MINERAL);
                break;
        }
    },
};

module.exports = mineralHarvester;