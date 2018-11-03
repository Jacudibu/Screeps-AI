const RANGE_TO_COUNT_AS_SEPARATED = 5;
const TOWER_ANTI_HEALER_DAMAGE_FACTOR = 0.5;

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

    if (threat.heal === 0 || (this.controller && this.controller.safeMode)) {
        defendAgainstAttackWithoutHealers(this.myTowers, hostiles);
        return;
    }

    if (threat.heal * HEAL_POWER < this.myTowers.length * TOWER_POWER_ATTACK * TOWER_ANTI_HEALER_DAMAGE_FACTOR) {
        focusClosestHealer(this.myTowers, hostiles);
        return;
    }

    const separatedEnemy = findEnemySeparatedFromHealers(hostiles);
    if (separatedEnemy !== ERR_NOT_FOUND) {
        commandTowersToFocusTarget(this.myTowers, separatedEnemy[0]);
        return;
    }

    // TODO: Find seperated healers which can't sustain focus fire by themselves
    // our last hope. :D
    //spreadFire(this.towers, this._dangerousHostiles);
};

const defendAgainstAttackWithoutHealers = function(towers, hostiles) {
    const closestEnemy = towers[0].pos.findClosestByRange(hostiles);
    if (closestEnemy.hitsMax < towers[0].calculateExpectedDamage(closestEnemy)) {
        towers[0].attack(closestEnemy);

        if (towers.length > 1 && hostiles.length > 1) {
            spreadFire(towers.slice(1), hostiles);
        }
    } else {
        commandTowersToFocusTarget(towers, closestEnemy);
    }
};

const focusClosestHealer = function(towers, hostiles) {
    const healers = hostiles.filter(creep => creep.isHealer());

    // TODO: Use this.centerPosition once that's set up everywhere.
    const closestHealer = towers[0].pos.findClosestByRange(healers);
    commandTowersToFocusTarget(towers, closestHealer);
};

const findEnemySeparatedFromHealers = function(hostiles) {
    const healers = hostiles.filter(creep =>  creep.isHealer());
    const others  = hostiles.filter(creep => !creep.isHealer());

    const separatedEnemies = [];
    for (let creep of others) {
        if (healers.every(healer => creep.pos.getRangeTo(healer) > RANGE_TO_COUNT_AS_SEPARATED)) {
            separatedEnemies.push(creep);
        }
    }

    if (separatedEnemies.length === 0) {
        return ERR_NOT_FOUND;
    }

    return separatedEnemies;
};

const spreadFire = function(towers, hostileCreeps) {
    towers.forEach(tower => tower.attack(hostileCreeps[_.random(0, hostileCreeps.length)]));
};

const commandTowersToFocusTarget = function(towers, target) {
    for (let i = 0; i < towers.length; i++) {
        towers[i].attack(target);
    }
};
