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

        if (this.isRoleNeeded(room, ROLE.HARVESTER)) {
            this.spawnHarvester(spawn, true);
        } else if (this.isRoleNeeded(room, ROLE.UPGRADER)) {
            this.spawnWorker(spawn, ROLE.UPGRADER, true);
        } else if (this.isRoleNeeded(room, ROLE.BUILDER)) {
            this.spawnWorker(spawn, ROLE.BUILDER, true);
        } else if (this.isRoleNeeded(room, ROLE.REPAIRER)) {
            this.spawnWorker(spawn, ROLE.REPAIRER, true);
        } else if (this.isRoleNeeded(room, ROLE.HAULER)) {
            this.spawnHauler(spawn, true);
        } else if (room.energyCapacityAvailable === room.energyAvailable) {
            if (spawn.memory.nextAutoSpawn) {
                if (spawn.memory.nextAutoSpawn === Game.time) {
                    this.spawnWorker(spawn, ROLE.UPGRADER, false);
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

    spawnWorker: function(spawn, role, blockSpawningIfNoResources) {
        let body = [];

        let energy = spawn.room.energyCapacityAvailable;

        if (energy > 200 * 16) {
            energy = 200 * 16;
        }

        while (energy >= 200) {
            body.push(WORK, CARRY, MOVE);
            energy -= 200;
        }

        body.sort();

        this.spawnCreep(spawn, role, blockSpawningIfNoResources, body, {memory: {role: role}});
    },

    spawnHauler: function(spawn, blockSpawningIfNoResources) {
        let body = [];

        let energy = spawn.room.energyCapacityAvailable;

        if (energy > 5000) {
            energy = 5000;
        }

        while(energy >= 100) {
            body.push(CARRY, MOVE);
            energy -= 100;
        }

        body.sort();

        this.spawnCreep(spawn, ROLE.HAULER, blockSpawningIfNoResources, body, {memory: {role: ROLE.HAULER}});
    },

    spawnHarvester: function(spawn, blockSpawningIfNoResources) {
        let body = [];

        let energy = spawn.room.energyCapacityAvailable;

        if (energy > 650) {
            energy = 650;
        }

        body.push(MOVE);
        energy -= 50;

        while (energy >= 100) {
            body.push(WORK);
            energy -= BODYPART_COST.work;
        }

        body.sort();

        this.spawnCreep(spawn, ROLE.HARVESTER, blockSpawningIfNoResources, body, {memory: {role: ROLE.HARVESTER}});
    },

    spawnCreep: function(spawn, role, blockSpawningIfNoResources, body, memory) {
        let name = role + '#' + Memory.creepsBuilt;

        switch (spawn.spawnCreep(body, name, memory)) {
            case OK:
                spawn.room.memory.allowEnergyCollection = true;
                Memory.creepsBuilt = Memory.creepsBuilt + 1;
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                if (blockSpawningIfNoResources) {
                    spawn.room.memory.allowEnergyCollection = false;
                }
                break;
            default:
                console.log("unexpected error when spawning creep: " + spawn.spawnCreep(body, name, memory)
                    + "\nBody: " + body + " name:" + name + "memory:" + memory);
                spawn.room.memory.allowEnergyCollection = true;
                break;
        }
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