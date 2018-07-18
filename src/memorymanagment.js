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
            let source = Game.getObjectById(creep.targetSourceId);
            source.room.memory.sources[source.id].assignedWorkers--;
        }
    }
};

module.exports = memoryManagment;