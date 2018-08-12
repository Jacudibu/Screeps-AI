const memoryManagment = {

    run: function() {
        this.deleteDeadCreeps();
        this.resetRoomCaches();
    },

    resetRoomCaches: function() {
        for (let roomName in Game.rooms) {
            Game.rooms[roomName]._freeSpawnsTowersAndExtensions = undefined;
            Game.rooms[roomName]._emptyPublicEnergyContainers = undefined;
        }
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
                Memory.rooms[creep.targetRoomName].assignedHarvesters--;
                let keys = Object.keys(Memory.rooms[creep.targetRoomName].sources);
                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i] === creep.taskTargetId) {
                            Memory.rooms[creep.targetRoomName].sources[keys[i]].workersAssigned--;
                        }
                }
                break;

            case ROLE.REMOTE_HARVESTER:
                Memory.rooms[creep.targetRoomName].assignedHarvesters--;
                let keys2 = Object.keys(Memory.rooms[creep.targetRoomName].sources);
                for (let i = 0; i < keys2.length; i++) {
                    if (keys2[i] === creep.taskTargetId) {
                        Memory.rooms[creep.targetRoomName].sources[keys2[i]].workersAssigned--;
                    }
                }
                break;


            case ROLE.REMOTE_HAULER:
                Memory.rooms[creep.remoteHaulTargetRoom].assignedHaulers--;
                break;

            case ROLE.REMOTE_REPAIRER:
                if (creep.respawnTTL) {
                    let args = {
                        role: ROLE.REMOTE_REPAIRER,
                        route: creep.route,
                    };
                    Memory.rooms[creep.spawnRoom].spawnQueue.push(args);
                }
                break;

            case ROLE.RESERVER:
                Memory.rooms[creep.targetRoomName].isReserverAssigned = false;
                break;
        }
    },


};

module.exports = memoryManagment;