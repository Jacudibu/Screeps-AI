const harvester = {
    run(creep) {
        switch (creep.task) {
            case TASK.HARVEST_ENERGY:
                creep.harvestEnergyInBase();
                break;
            case TASK.MOVE_ONTO_CONTAINER:
                creep.moveOntoContainer(TASK.HARVEST_ENERGY);
                break;
            case TASK.MOVE_TO_ROOM:
                if (!creep.targetRoomName) {
                    if (creep.respawnTTL) {
                        creep.respawnTTL = null;
                    }

                    creep.targetRoomName = creep.spawnRoom;
                }
                creep.moveToRoom(TASK.HARVEST_ENERGY);
                break;
            default:
                creep.setTask(TASK.MOVE_ONTO_CONTAINER);
                this.run(creep);
                break;
        }
    },
};

module.exports = harvester;