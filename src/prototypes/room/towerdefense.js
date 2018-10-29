const TOWER_MIN_DAMAGE = TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF);

Room.prototype.commandTowersToAttackHostiles = function() {
    if (this.towers.length === 0) {
        return;
    }

    const threat = roomThreats[this.name];

    if (!threat) {
        // Kill scouts and such things
        const allHostiles = this.find(FIND_HOSTILE_CREEPS);
        if (allHostiles.length > 0) {
            if (this.towers.length > 0) {
                this.towers[0].attack(allHostiles[0]);
            }
        }
        return;
    }

    const hostiles = this._dangerousHostiles;

    if (threat.heal === 0) {
        focusClosestEnemy(this.myTowers, hostiles);
        return;
    }

    if (threat.heal * HEAL_POWER < TOWER_FALLOFF_RANGE) {
        focusClosestHealer(this.myTowers, hostiles);
        return;
    }

    // our last hope. :D
    spreadFire(this.towers, this._dangerousHostiles);
};

const focusClosestEnemy = function(towers, hostiles) {
    const closestEnemy = towers[0].findClosestByRange(hostiles);
    commandTowersToFocusTarget(towers, closestEnemy);
};

const focusClosestHealer = function(towers, hostiles) {
    const healers = hostiles.filter(creep => creep.isHealer());

    // TODO: Use this.centerPosition once that's set up everywhere.
    const closestHealer = towers[0].findClosestByRange(healers);
    commandTowersToFocusTarget(towers, closestHealer);
};

const spreadFire = function(towers, hostileCreeps) {
    towers.forEach(tower => tower.attack(hostileCreeps[_.random(0, hostileCreeps.length)]));
};


const commandTowersToFocusTarget = function(towers, target) {
    for (let i = 0; i < towers.length; i++) {
        towers[i].attack(target);
    }
};
