const RAMPART_TOWER_REPAIR_THRESHOLD = 7500;

Room.prototype.runDefenseProcedures = function() {
    this.commandTowersToAttackHostiles();

    if (this.shouldSafeModeBeActivated()) {
        this.controller.activateSafeMode();
    }
};

Room.prototype.shouldSafeModeBeActivated = function() {
    if (!roomThreats[this.name]) {
        return false;
    }

    if (this.controller.safeMode || this.controller.safeModeCooldown || this.controller.safeModeAvailable === 0) {
        return false;
    }

    let spawns = this.mySpawns;
    if (this.mySpawns.length === 0) {
        if (this.find(FIND_MY_CREEPS).some(creep => creep.countBodyPartsOfType(WORK))) {
            // spawn is just being constructed and someone is attacking us! o_o
            return true;
        }
    }

    for (let i = 0; i < spawns.length; i++) {
        let spawn = spawns[i];

        if (spawn.hits < 5000) {
            return true;
        }

        if (spawn.pos.findInRange(FIND_HOSTILE_CREEPS, 3).some(creep => creep.canDealSomeSortOfDamage())) {
            return true;
        }
    }

    return this.controller.pos.findInRange(FIND_HOSTILE_CREEPS, 2).some(creep => creep.canAttackController());
};

Room.prototype.repairDamagedCreeps = function() {
    let damagedCreeps = this.findDamagedCreeps();
    if (damagedCreeps.length > 0) {
        this.commandTowersToHealCreep(damagedCreeps[0]);
    }
};

Room.prototype.repairAlmostBrokenRamparts = function() {
    const almostBrokenRamparts = this.ramparts.filter(rampart => rampart && rampart.hits < RAMPART_TOWER_REPAIR_THRESHOLD);

    if (almostBrokenRamparts.length === 0) {
        return ERR_NOT_FOUND;
    }

    const mostBrokenRampart = _.min(almostBrokenRamparts, rampart => rampart.hits);
    this.commandTowersToRepairStructure(mostBrokenRampart);
    return OK;
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