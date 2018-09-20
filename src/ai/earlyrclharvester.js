const earlyRCLHarvester = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.HARVEST_ENERGY:
                let nextTask = creep.room.controller.ticksToDowngrade < 1000 ? TASK.UPGRADE_CONTROLLER : TASK.STORE_ENERGY;

                if (_.sum(creep.carry) === creep.carryCapacity) {
                    creep.setTask(nextTask);
                    this.run(creep);
                } else {
                    creep.harvestEnergyInLowRCLRoom(nextTask);
                }
                break;

            case TASK.STORE_ENERGY:
                creep.storeEnergy(TASK.HARVEST_ENERGY, TASK.BUILD_STRUCTURE);
                break;

            case TASK.BUILD_STRUCTURE:
                // No waiting for new construction sites, as this could make them stop doing anything, which would suck.
                creep.buildStructures(TASK.REPAIR_STRUCTURE, TASK.HARVEST_ENERGY);
                break;

            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.UPGRADE_CONTROLLER, TASK.HARVEST_ENERGY);
                break;

            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.HARVEST_ENERGY, 1);
                break;

            default:
                creep.setTask(TASK.HARVEST_ENERGY);
                break;
        }
    }
};
module.exports = earlyRCLHarvester;