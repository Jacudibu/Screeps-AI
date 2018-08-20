const roomLogic = {
    run: function() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];

            this.checkForHostiles(room);
            if (room._hostiles.length === 0) {
                room.memory.requiresHelp = undefined;
            } else {
                if (room.memory.length < 2) {
                    room.memory.requiresHelp = undefined;
                    return;
                }

                if (room.memory.requiresHelp === undefined) {
                    room.memory.requiresHelp = true;
                    if (room._hostiles[0].owner && room._hostiles[0].owner.username && room._hostiles[0].owner.username !== "Invader") {
                        Game.notify(room.name + " is being attacked by " + room._hostiles[0].owner.username +
                            "   First creep detected has the following body: " + JSON.stringify(room._hostiles[0].body, null, 2));
                    }
                }

                room._hostiles = this.sortHostilesByPriority(room._hostiles);
                room.commandTowersToAttackTarget(room._hostiles[0]);
                this.checkIfSafeModeShouldBeActivated(room);
            }

            this.repairDamagedCreeps(room);
        }
    },

    checkForHostiles: function(room) {
        room._hostiles = room.find(FIND_HOSTILE_CREEPS, {
            filter: creep =>
                creep.countBodyPartsOfType(ATTACK) > 0
                || creep.countBodyPartsOfType(RANGED_ATTACK) > 0
                || creep.countBodyPartsOfType(HEAL) > 0
                || creep.countBodyPartsOfType(WORK) > 1
        });
    },

    checkIfSafeModeShouldBeActivated: function(room) {
        let spawns = room.mySpawns;
        for (let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];

            if (spawn.hits < 5000 && !room.controller.safeMode) {
                room.controller.activateSafeMode();
            }
        }
    },

    repairDamagedCreeps(room) {
        let damagedCreeps = room.findDamagedCreeps();
        if (damagedCreeps.length > 0) {
            room.commandTowersToHealCreep(damagedCreeps[0]);
        }
    },

    sortHostilesByPriority(hostiles) {
        hostiles.sort(function(creepA, creepB) {
            let healsA = creepA.countBodyPartsOfType(HEAL);
            let healsB = creepB.countBodyPartsOfType(HEAL);

            if (healsA > 0 && healsB === 0) {
                return -1;
            }
            if (healsB > 0 && healsA === 0) {
                return 1;
            }

            return creepA.hits - creepB.hits;
        });

        return hostiles;
    }
};

module.exports = roomLogic;