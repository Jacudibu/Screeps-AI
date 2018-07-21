const towerDefense = {
    run : function() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];

            let hostiles = room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                this.attackHostiles(room, hostiles);
                return;
            }

            let damagedCreeps = _.filter(room.find(FIND_MY_CREEPS), function (creep) {
                return creep.hits < creep.hitsMax;
            });

            if (damagedCreeps.length > 0) {
                this.repairCreeps(room, damagedCreeps);
            }
        }
    },

    attackHostiles: function(room, hostiles) {
        let towers = _.filter(room.find(FIND_MY_STRUCTURES), function (structure) {
            return structure.structureType === STRUCTURE_TOWER;
        });

        if (towers.length === 0) {
            return;
        }

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

        for (let i = 0; i < towers.length; i++) {
            towers[i].attack(hostiles[0]);
        }
    },

    repairCreeps: function(room, damagedCreeps) {
        let towers = _.filter(room.find(FIND_MY_STRUCTURES), function (structure) {
            return structure.structureType === STRUCTURE_TOWER;
        });

        damagedCreeps.sort(function(a, b) {return a.hits - b.hits;});

        for (let i = 0; i < towers.length; i++) {
            towers[i].heal(damagedCreeps[i]);
        }
    },
};

module.exports = towerDefense;