const hauler = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HAUL_ENERGY:
                creep.haulEnergy(TASK.STORE_ENERGY);
                break;
            case TASK.STORE_ENERGY:
                if (creep.memory.hauledResourceType === RESOURCE_ENERGY) {
                    creep.storeEnergy(TASK.HAUL_ENERGY);
                } else {
                    creep.storeMineral(TASK.HAUL_ENERGY);
                }
                break;
            case TASK.RENEW_CREEP:
                creep.renew(TASK.HAUL_ENERGY);
                break;
            default:
                creep.setTask(TASK.HAUL_ENERGY);
                break;
        }
    },
};

module.exports = hauler;