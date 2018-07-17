const memoryManagment = {

    run: function() {
        this.deleteDeadCreeps()
    },

    deleteDeadCreeps: function() {
        for(let creepMemory in Memory.creeps) {
            if(!Game.creeps[creepMemory]) {
                this.deletePotentialHarvester(creepMemory);
                delete Memory.creeps[creepMemory];
            }
        }
    },

    deletePotentialHarvester: function (creepMemoryJson) {
        if (creepMemoryJson.targetSourceId != null) {
            let source = Game.getObjectById(creepMemoryJson.targetSourceId);
            source.room.memory.sources[source.id].workers--;
        }
    }
};

module.exports = memoryManagment;