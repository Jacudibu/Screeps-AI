const memoryManagment = {

    run: function() {
        this.deleteDeadCreeps()
    },

    deleteDeadCreeps: function() {
        for(let creepName in Memory.creeps) {
            if(Game.creeps[creepName]) {
                continue;
            }

            let creep = Memory.creeps[creepName];
            this.deletePotentialHarvester(creep);

            delete Memory.creeps[creepName];
        }
    },

    deletePotentialHarvester: function (creep) {
        if (creep.role === ROLE.HARVESTER) {
            if (creep.task === TASK.HARVEST_ENERGY) {
                let source = Game.getObjectById(creep.taskTargetId);
                if (source) {
                    source.memory.workersAssigned--;
                }
            }
        }
    }
};

module.exports = memoryManagment;