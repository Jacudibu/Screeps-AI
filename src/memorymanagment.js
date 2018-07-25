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
                let keys = Object.keys(Memory.rooms[creep.targetRoomName].sources);
                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i] === creep.taskTargetId) {
                            Memory.rooms[creep.targetRoomName].sources[keys[i]].workersAssigned--;
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