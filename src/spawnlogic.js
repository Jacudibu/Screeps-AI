const spawnlogic = {
    run: function() {
        for (const i in Game.spawns) {
            this.spawnCreepsIfNeeded(Game.spawns[i]);
        }
    },

    spawnCreepsIfNeeded: function(spawn) {
        if (spawn.spawning) {
            spawn.room.visual.text('🛠️' + spawn.spawning.name, spawn.pos.x + 1, spawn.pos.y,
                {align: 'left', opacity: '0.5'});
            return;
        }

        const room = spawn.room;

        if (room.memory.requestedCreeps === undefined) {
            this.initSpawnMemory(spawn.room);
        }

        let energy = room.energyCapacityAvailable;

        if (this.isRoleNeeded(room, ROLE.HARVESTER, energy)) {
            spawn.spawnHarvester(energy, true);
        } else if (this.isRoleNeeded(room, ROLE.HAULER, energy)) {
            spawn.spawnHauler(energy, true);
        } else if (this.isRoleNeeded(room, ROLE.UPGRADER, energy)) {
            spawn.spawnWorker(ROLE.UPGRADER, energy, true);
        } else if (this.isRoleNeeded(room, ROLE.BUILDER, energy)
                && room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            spawn.spawnWorker(ROLE.BUILDER, energy, true);
        } else if (this.isRoleNeeded(room, ROLE.REPAIRER, energy)) {
            spawn.spawnWorker(ROLE.REPAIRER, energy, true);
        } else if (room.energyCapacityAvailable === room.energyAvailable) {
            if (spawn.memory.nextAutoSpawn) {
                if (spawn.memory.nextAutoSpawn === Game.time) {
                    spawn.spawnWorker(ROLE.UPGRADER, energy, false);
                }
                else if (spawn.memory.nextAutoSpawn < Game.time) {
                    spawn.memory.nextAutoSpawn = Game.time + AUTO_SPAWN_TIMER;
                }
            } else {
                spawn.memory.nextAutoSpawn = Game.time + AUTO_SPAWN_TIMER;
            }
        }
    },

    isRoleNeeded: function(room, role) {
        let creepsWithRoleCount = this.countNumberOfCreepsWithRole(role);
        return creepsWithRoleCount < room.memory.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(role) {
        return _.sum(Game.creeps, creep => creep.memory.role === role);
    },

    initSpawnMemory: function(room) {
        room.memory.currentTier = 1;

        room.memory.requestedCreeps = {};
        room.memory.requestedCreeps[ROLE.HARVESTER] = 9;
        room.memory.requestedCreeps[ROLE.UPGRADER] = 1;
        room.memory.requestedCreeps[ROLE.BUILDER] = 1;
        room.memory.requestedCreeps[ROLE.REPAIRER] = 1;
    },
};

module.exports = spawnlogic;