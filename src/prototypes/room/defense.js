const RAMPART_TOWER_REPAIR_THRESHOLD = 7500;

Room.prototype.attackHostiles = function() {
    if (!roomThreats[this.name]) {
        // Kill scouts and such things
        const allHostiles = this.find(FIND_HOSTILE_CREEPS);
        if (allHostiles.length > 0) {
            if (this.towers.length > 0) {
                this.towers[0].attack(allHostiles[0]);
            }
        }
        return;
    }

    this.commandTowersToAttackTarget(this._dangerousHostiles[0]);
    if (this.shouldSafeModeBeActivated()) {
        this.controller.activateSafeMode();
    }
};

Room.prototype.shouldSafeModeBeActivated = function() {
    if (this.controller.safeMode || this.controller.safeModeCooldown) {
        return false;
    }

    let spawns = this.mySpawns;
    for (let i = 0; i < spawns.length; i++) {
        let spawn = spawns[i];

        if (spawn.hits < 5000) {
            return true;
        }

        if (spawn.pos.findInRange(FIND_HOSTILE_CREEPS, 3).some(creep => creep.canDealDamage())) {
            return true;
        }
    }

    if (this.controller.pos.findInRange(FIND_HOSTILE_CREEPS, 2).some(creep => creep.canAttackController())) {
        return true;
    }

    return false;
};

Room.prototype.repairDamagedCreeps = function() {
    let damagedCreeps = this.findDamagedCreeps();
    if (damagedCreeps.length > 0) {
        this.commandTowersToHealCreep(damagedCreeps[0]);
    }
};

Room.prototype.repairAlmostBrokenRamparts = function() {
    for(let rampart of this.ramparts) {
        if (rampart && rampart.hits < RAMPART_TOWER_REPAIR_THRESHOLD) {
            this.commandTowersToRepairStructure(rampart);
            return OK;
        }
    }

    return ERR_NOT_FOUND;
};

Room.prototype.sortHostilesByPriority = function() {
    this._dangerousHostiles = this._dangerousHostiles.sort(function(creepA, creepB) {
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
};