Room.prototype.update = function() {
    this.checkForHostiles();
    this.respondToHostiles();
    this.repairDamagedCreeps();
    this._runLabCode();
};

Room.prototype.respondToHostiles = function() {
    if (this._hostiles.length === 0) {
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

    this.sortHostilesByPriority();
    this.commandTowersToAttackTarget(this._hostiles[0]);
    this.checkIfSafeModeShouldBeActivated();
};

Room.prototype.checkForHostiles = function() {
    this._hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: creep =>
            creep.pos.x !== 0 && creep.pos.x !== 49 && creep.pos.y !== 0 && creep.pos.y !== 49
            &&(creep.countBodyPartsOfType(ATTACK) > 0
            || creep.countBodyPartsOfType(RANGED_ATTACK) > 0
            || creep.countBodyPartsOfType(HEAL) > 0
            || creep.countBodyPartsOfType(WORK) > 1)
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
    this._hostiles = this._hostiles.sort(function(creepA, creepB) {
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

Room.prototype._runLabCode = function() {
    if (this.inputLabs.length < 2) {
        return;
    }

    switch (this.memory.labtask) {
        case LABTASK.RUN_REACTION:
            this._doLabReactions();
            break;
        case LABTASK.DECIDE_WHAT_TO_DO:
            this._decideWhatToDo();
            break;
        case LABTASK.MAKE_EMPTY:
            this._makeEmpty();
            break;
        case LABTASK.BOOST_CREEP:
            // TODO: Empty labs & ship needed minerals to labs.
        default:
            this.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO;
            break;
    }
};

Room.prototype._doLabReactions = function() {
    for (let lab of this.outputLabs) {
        lab.runReaction(this.inputLabs[0], this.inputLabs[1]);
    }

    if (this.inputLabs[0].mineralAmount === 0 || this.inputLabs[1].mineralAmount === 0) {
        this.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO;
    } else {
        // TODO: set nextLabTick to Game.time + lab.cooldown
    }
};

Room.prototype._decideWhatToDo = function() {
    let keepCurrentReaction = true;

    for (let lab of this.outputLabs) {
        // TODO: check if required material is in store and if the end product of the reaction is still needed
    }

    if (keepCurrentReaction) {
        this.memory.labtask = LABTASK.RUN_REACTION;
        // TODO: Add some cooldown before checking again
    } else {
        if (this._areLabsEmpty()) {
            this.memory.labtask = LABTASK.RUN_REACTION;
        }

        this._determineReactionMaterials();
    }
};

Room.prototype._determineReactionMaterials = function() {
    // TODO: Automation
    this.inputLabs[0].requestedMineral = "U";
    this.inputLabs[1].requestedMineral = "H";

    this.memory.labtask = LABTASK.RUN_REACTION;
};

Room.prototype._makeEmpty = function() {
    if (this._areLabsEmpty()) {
        this.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO
    } else {
        // TODO: Increase nextLabTick by 50-100 ticks
    }
};

Room.prototype._areLabsEmpty = function() {
    for (let lab of this.labs) {
        if (lab.mineralAmount > 0) {
            return false;
        }
    }

    return true;
};