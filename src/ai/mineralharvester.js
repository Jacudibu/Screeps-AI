const mineralHarvester = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_MINERAL:
                creep.harvestMineral();
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoMineralContainer(TASK.HARVEST_MINERAL);
                break;
            default:
                creep.setTask(TASK.MOVE_ONTO_CONTAINER);
                break;
        }
    },
};

module.exports = mineralHarvester;
