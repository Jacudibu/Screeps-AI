Room.prototype.update = function() {
    this.checkForHostiles();
    this.updateThreat();
    this.respondToThreat();

    if (!(this.controller && this.controller.my)) {
        return;
    }

    this.repairDamagedCreeps();
    this.repairAlmostBrokenRamparts();
    this.tryPlacingConstructionSites();
};

Room.prototype.updateThreat = function() {
    if (this._hostiles.length === 0) {
        this.threat = null;
        return;
    }

    let threat = {
        players: [],
        attack: 0,
        ranged: 0,
        heal: 0,
        tough: 0,
        claim: 0,
        other: 0,
        total: 0,
    };

    for (let creep of this._hostiles) {
        if (!threat.players.includes(creep.owner.username)) {
            threat.players.push(creep.owner.username);
        }

        threat.attack += creep.countBodyPartsOfType(ATTACK);
        threat.ranged += creep.countBodyPartsOfType(RANGED_ATTACK);
        threat.heal   += creep.countBodyPartsOfType(HEAL);
        threat.tough  += creep.countBodyPartsOfType(TOUGH);
        threat.claim  += creep.countBodyPartsOfType(CLAIM);
        threat.other  += creep.countBodyPartsOfType(MOVE) + creep.countBodyPartsOfType(CARRY);
        threat.total  += creep.body.length;
    }

    this.threat = threat;
};

Room.prototype.respondToThreat = function() {
    if (!this.threat) {
        this.memory.requiresHelp = undefined;

        // Kill scouts and such things
        const allHostiles = this.find(FIND_HOSTILE_CREEPS);
        if (allHostiles.length > 0) {
            if (this.towers.length > 0) {
                this.towers[0].attack(allHostiles[0]);
            }

            this.commandTowersToAttackTarget(this.find(FIND_HOSTILE_CREEPS)[0]);
        }
        return;
    }

    if (this.memory.requiresHelp === undefined) {
        const myDefenseForce = this.find(FIND_MY_CREEPS, {filter: creep => creep.memory.role === ROLE.DEFENDER});
        if (myDefenseForce.length === 0) {
            this.memory.requiresHelp = true;
            if (/*this.threat.players[0] !== "Invader" &&*/ this.threat.players[0] !== "Source Keeper" && this.controller
                && (this.controller.my || this.controller.reservation && this.controller.reservation.username === "Jacudibu")) {
                const message = this.name + " is being attacked by " + JSON.stringify(this.threat.players) + "<br>" +
                    "Threat info: " + JSON.stringify(this.threat, null, 2);
                log.warning(message);

                if (this.threat.players[0] !== "Invader") {
                    Game.notify(message);
                }
            }
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
            &&    (creep.countBodyPartsOfType(ATTACK) > 0
                || creep.countBodyPartsOfType(RANGED_ATTACK) > 0
                || creep.countBodyPartsOfType(HEAL) > 0
                || creep.countBodyPartsOfType(WORK) > 4 && creep.countBodyPartsOfType(CARRY) < 4)
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

Room.prototype.repairAlmostBrokenRamparts = function() {
    for(let rampart of this.ramparts) {
        if (rampart.hits < 1500) {
            this.commandTowersToRepairStructure(rampart);
            return;
        }
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