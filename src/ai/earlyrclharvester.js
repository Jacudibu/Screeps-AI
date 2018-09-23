const earlyRCLHarvester = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.HAUL_ENERGY:
                if (creep.haulEnergy(TASK.STORE_ENERGY) === ERR_NOT_FOUND) {
                    this.setTask(TASK.HARVEST_ENERGY);
                    this.run(creep);
                }
                break;

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
                creep.storeEnergy(TASK.HAUL_ENERGY, TASK.BUILD_STRUCTURE);
                break;

            case TASK.BUILD_STRUCTURE:
                creep.buildStructures(TASK.REPAIR_STRUCTURE, TASK.HAUL_ENERGY, true);
                break;

            case TASK.REPAIR_STRUCTURE:
                creep.repairStructures(TASK.UPGRADE_CONTROLLER, TASK.HAUL_ENERGY);
                break;

            case TASK.UPGRADE_CONTROLLER:
                creep.upgradeRoomController(TASK.HAUL_ENERGY, 1);
                break;

            default:
                creep.setTask(TASK.HAUL_ENERGY);
                break;
        }
    }
};
module.exports = earlyRCLHarvester;