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
                Memory.rooms[creep.targetRoomName].assignedRemoteWorkers--;
                for (let i = 0; i < Memory.rooms[creep.targetRoomName].sources.length; i++) {
                    if (Memory.rooms[creep.targetRoomName].sources[i] === creep.taskTargetId) {
                        Memory.rooms[creep.targetRoomName].sources[i].workersAssigned--;
                    }
                }
                break;
            case ROLE.REMOTE_HAULER:
                Memory.rooms[creep.remoteHaulTargetRoom].isHaulerRequired = true;
                break;
        }
    },


};

module.exports = memoryManagment;