Creep.prototype.countBodyPartsOfType = function(types) {
    return _.filter(this.body, function(bodyPart) {return bodyPart.type === types}).length;
};

Creep.prototype.canDealSomeSortOfDamage = function() {
    return this.countBodyPartsOfType(RANGED_ATTACK) > 0
        || this.countBodyPartsOfType(ATTACK) > 0
        || this.countBodyPartsOfType(WORK) > 0
};

Creep.prototype.isHealer = function() {
    return this.countBodyPartsOfType(HEAL) > 0;
};

Creep.prototype.isRangedAttacker = function() {
    return this.countBodyPartsOfType(RANGED_ATTACK) > 0;
};

Creep.prototype.isMeleeAttacker = function() {
    return this.countBodyPartsOfType(ATTACK) > 0;
};

Creep.prototype.isDismantler = function() {
    return this.countBodyPartsOfType(WORK) > 0;
};

Creep.prototype.canAttackController = function() {
    return this.countBodyPartsOfType(CLAIM) > 0;
};