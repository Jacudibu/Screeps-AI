Room.prototype.attackHostiles = function() {
    if (!this.threat) {
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
    this.checkIfSafeModeShouldBeActivated();
};

Room.prototype.checkIfSafeModeShouldBeActivated = function() {
    let spawns = this.mySpawns;
    for (let i = 0; i < spawns.length; i++) {
        let spawn = spawns[i];

        if (spawn.hits < 5000 && !this.controller.safeMode) {
            this.controller.activateSafeMode();
        }
    }
};

Room.prototype.repairDamagedCreeps = function() {
    let damagedCreeps = this.findDamagedCreeps();
    if (damagedCreeps.length > 0) {
        this.commandTowersToHealCreep(damagedCreeps[0]);
    }
};

Room.prototype.repairAlmostBrokenRamparts = function() {
    for(let rampart of this.ramparts) {
        if (rampart && rampart.hits < 1500) {
            this.commandTowersToRepairStructure(rampart);
            return;
        }
    }
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