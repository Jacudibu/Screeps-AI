const remoteWorker = {
    run: function(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.memory.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }

                if (_.sum(creep.carry) < 10) {
                    creep.determineHarvesterStartTask(TASK.HARVEST_ENERGY_FETCH);
                    return;
                }

                if (creep.memory.containerId) {
                    let container = Game.getObjectById(creep.memory.containerId);
                    if (container.hits < container.hitsMax) {
                        if (creep.repair(container) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(container);
                        }
                        creep.say("ò.ó", true);
                        return;
                    }
                }

                creep.say('ಥ~ಥ');
                creep.drop(RESOURCE_ENERGY);
                creep.setTask(TASK.HARVEST_ENERGY_FETCH);
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.HARVEST_ENERGY_FETCH:
                creep.harvestEnergyAndFetch(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.STORE_ENERGY:
                creep.drop(RESOURCE_ENERGY);
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoContainer(TASK.HARVEST_ENERGY_FETCH);
                break;
            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    }
};
module.exports =remoteWorker;