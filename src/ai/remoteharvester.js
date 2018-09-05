const remoteWorker = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (creep.room.name !== creep.memory.targetRoomName) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                }

                if (_.sum(creep.carry) < 10) {
                    let startTask = creep.determineHarvesterStartTask(TASK.HARVEST_ENERGY_FETCH);
                    if (startTask === TASK.HARVEST_ENERGY_FETCH || startTask === TASK.MOVE_ONTO_CONTAINER) {
                        this.run(creep);
                    }
                    return;
                }
                creep.setTask(TASK.HARVEST_ENERGY_FETCH);
                break;
            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;
            case TASK.HARVEST_ENERGY_FETCH:
                creep.harvestEnergyInRemoteRoom();
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