const LERP_FACTOR = 1 / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);

StructureTower.prototype.calculateExpectedDamage = function(target) {
    const distance = this.pos.getRangeTo(target);
    return calculateTowerValueFalloff(TOWER_POWER_ATTACK, distance);
};

StructureTower.prototype.calculateExpectedHealing = function(target) {
    const distance = this.pos.getRangeTo(target);
    return calculateTowerValueFalloff(TOWER_POWER_HEAL, distance);
};

StructureTower.prototype.calculateExpectedRepair = function(target) {
    const distance = this.pos.getRangeTo(target);
    return calculateTowerValueFalloff(TOWER_POWER_REPAIR, distance);
};

const calculateTowerValueFalloff = function(value, distance) {
    if (distance <= TOWER_OPTIMAL_RANGE) {
        return value;
    }

    if (distance >= TOWER_FALLOFF_RANGE) {
        distance = TOWER_FALLOFF_RANGE;
    }

    return value - (value * TOWER_FALLOFF * (distance - TOWER_OPTIMAL_RANGE) * LERP_FACTOR);
};