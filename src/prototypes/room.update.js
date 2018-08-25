Room.prototype.update = function() {
    this.checkForHostiles();
    this.respondToHostiles();
    this.repairDamagedCreeps();
};

Room.prototype.respondToHostiles = function() {
    if (this._hostiles.length === 0) {
        this.memory.requiresHelp = undefined;
        return;
    }

    if (this.memory.length < 2) {
        this.memory.requiresHelp = undefined;
        return;
    }

    if (this.memory.requiresHelp === undefined) {
        this.memory.requiresHelp = true;
        if (this._hostiles[0].owner && this._hostiles[0].owner.username && this._hostiles[0].owner.username !== "Invader") {
            Game.notify(this.name + " is being attacked by " + this._hostiles[0].owner.username +
                "   First creep detected has the following body: " + JSON.stringify(this._hostiles[0].body, null, 2));
        }
    }

    this._hostiles = this.sortHostilesByPriority(this._hostiles);
    this.commandTowersToAttackTarget(this._hostiles[0]);
    this.checkIfSafeModeShouldBeActivated();
};

Room.prototype.checkForHostiles = function() {
    this._hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: creep =>
            creep.countBodyPartsOfType(ATTACK) > 0
            || creep.countBodyPartsOfType(RANGED_ATTACK) > 0
            || creep.countBodyPartsOfType(HEAL) > 0
            || creep.countBodyPartsOfType(WORK) > 1
    });
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

Room.prototype.sortHostilesByPriority = function() {
    this._hostiles.sort(function(creepA, creepB) {
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