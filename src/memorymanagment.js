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
            this.deleteRoleSpecificStuff(creep);

            delete Memory.creeps[creepName];
        }
    },

    deleteRoleSpecificStuff: function (creep) {
        switch (creep.role)
        {
            case ROLE.HARVESTER:
                if (creep.task === TASK.HARVEST_ENERGY) {
                    let source = Game.getObjectById(creep.taskTargetId);
                    if (source) {
                        source.memory.workersAssigned--;
                    }
                }
                break;
            case ROLE.REMOTE_WORKER:
                Memory.rooms[creep.targetRoomName].memory.assignedRemoteWorkers--;
                break;
            case ROLE.REMOTE_HAULER:
                Memory.rooms[creep.remoteHaulTargetRoom].memory.isHaulerRequired = true;
                break;
        }
    },


};

module.exports = memoryManagment;