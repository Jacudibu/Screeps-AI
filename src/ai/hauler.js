const hauler = {
    run: function (creep) {
        switch (creep.memory.task) {
            case TASK.HAUL_ENERGY: // TODO: old. Delete after some time.
            case TASK.HAUL_RESOURCE:
                creep.haulAnyResource(TASK.STORE_RESOURCE);
                break;

            case TASK.STORE_ENERGY: // TODO: old. Delete after some time.
            case TASK.STORE_RESOURCE:
                if (creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.storeEnergy(TASK.HAUL_RESOURCE);
                } else {
                    creep.storeMineral(TASK.HAUL_RESOURCE);
                }
                break;

            case TASK.RENEW_CREEP:
                creep.renew(TASK.HAUL_RESOURCE);
                break;
            default:
                creep.setTask(TASK.HAUL_RESOURCE);
                break;
        }
    },
};

module.exports = hauler;