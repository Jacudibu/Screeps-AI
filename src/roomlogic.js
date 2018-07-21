const roomLogic = {
    run: function() {
        for (let roomName in Game.rooms) {
            this.runRoom(Game.rooms[roomName]);
        }
    },

    runRoom: function(room) {
        let hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            hostiles = this.sortHostilesByPriority(hostiles);
            room.commandTowersToAttackTarget(hostiles[0]);
        }

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