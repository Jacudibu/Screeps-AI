const towerDefense = {
    run : function() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];

            let hostiles = room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length === 0) {
                return;
            }

            let towers = _.filter(room.find(FIND_MY_STRUCTURES), function (structure) {
                return structure.structureType === STRUCTURE_TOWER;
            });

            if (towers.length === 0) {
                return;
            }

            hostiles.sort(function(creepA, creepB) {
                healsA = this.countBodyParts(creepA.body, HEAL);
                healsB = this.countBodyParts(creepB.body, HEAL);

                if (healsA > 0 && healsB === 0) {
                    return -1;
                }
                if (healsB > 0 && healsA === 0) {
                    return 1;
                }

                return creepA.hits - creepB.hits;
            });

            for (let i = 0; i < towers.length; i++) {
                towers[i].attack(hostiles[0]);
            }
        }
    },

    countBodyParts : function(body, part) {
        return _.filter(body, function(bodyPart) {return bodyPart === part}).length;
    }
};

module.exports = towerDefense;