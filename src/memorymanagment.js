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
                source.room.memory.sources[source.id].assignedWorkers--;
            }
        }
    }
};

module.exports = memoryManagment;