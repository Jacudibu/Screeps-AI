Room.prototype.checkForHostiles = function() {
    this._dangerousHostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: creep =>
            creep.pos.x !== 0 && creep.pos.x !== 49 && creep.pos.y !== 0 && creep.pos.y !== 49
            && (creep.isMeleeAttacker()
            ||  creep.isRangedAttacker()
            ||  creep.isHealer()
            ||  creep.isDismantler()
            ||  creep.canAttackController())
    });
};

global.roomThreats = {};
global.roomThreatResponses = {};

Room.prototype.updateThreat = function() {
    this.updateHostileThreat();
    this.updateThreatResponse();
};

Room.prototype.updateHostileThreat = function() {
    if (this._dangerousHostiles.length === 0) {
        roomThreats[this.name] = null;
        return;
    }

    let threat = {
        players: [],
        onlyNPCs: false, // will be set later
        creepCount: 0,

        attack: 0,
        ranged: 0,
        heal: 0,
        tough: 0,
        work: 0,
        claim: 0,
        other: 0,
        total: 0,
    };

    for (let creep of this._dangerousHostiles) {
        if (!threat.players.includes(creep.owner.username)) {
            threat.players.push(creep.owner.username);
        }

        threat.creepCount++;
        threat.attack += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(ATTACK);
        threat.ranged += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(RANGED_ATTACK);
        threat.heal   += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(HEAL);
        threat.tough  += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(TOUGH);
        threat.claim  += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(CLAIM);
        threat.work   += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(WORK);
        threat.other  += creep.countBodyPartsOfType(MOVE) + creep.countBodyPartsOfType(CARRY); // cheaper calculation as no benefit for fighting
        threat.total  += creep.body.length;
    }

    threat.onlyNPCs = threat.players.length === 1
                   &&(threat.players[0] === INVADER_PLAYER_NAME || threat.players[0] === SOURCE_KEEPER_PLAYER_NAME);

    roomThreats[this.name] = threat;
};


Room.prototype.updateThreatResponse = function() {
    if (this._dangerousHostiles.length === 0) {
        roomThreatResponses[this.name] = null;
        return;
    }

    const availableDefenders = this.find(FIND_MY_CREEPS, {
        filter: c => c.isMeleeAttacker() || c.isRangedAttacker() || c.isHealer()
    });

    if (availableDefenders.length === 0) {
        roomThreatResponses[this.name] = null;
        return;
    }

    let threatResponse = {
        creepCount: 0,
        attack: 0,
        ranged: 0,
        heal: 0,
        tough: 0,
        work: 0,
        claim: 0,
        other: 0,
        total: 0,
    };

    for (let creep of availableDefenders) {
        threatResponse.creepCount++;
        threatResponse.attack += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(ATTACK);
        threatResponse.ranged += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(RANGED_ATTACK);
        threatResponse.heal   += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(HEAL);
        threatResponse.tough  += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(TOUGH);
        threatResponse.work   += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(WORK);
        threatResponse.claim  += creep.countActiveBodyPartsOfTypeAndApplyBoostWeighting(CLAIM);
        threatResponse.other  += creep.countBodyPartsOfType(MOVE) + creep.countBodyPartsOfType(CARRY); // cheaper calculation as no benefit for fighting
        threatResponse.total  += creep.body.length;
    }

    roomThreatResponses[this.name] = threatResponse;
};

Room.prototype.askForHelpIfThreatDetected = function() {
    if (!roomThreats[this.name]) {
        this.memory.requiresHelp = undefined;
        return;
    }

    if (this.memory.requiresHelp === undefined) {
        if (!roomThreatResponses[this.name]) {
            this.memory.requiresHelp = true;
            if (  !roomThreats.onlyNPCs
                && this.controller
                &&(this.controller.my || this.controller.reservation && this.controller.reservation.username === "Jacudibu")) {

                const message = this + " is being attacked by " + JSON.stringify(roomThreats[this.name].players) + "<br>" +
                    "Threat info: " + JSON.stringify(roomThreats[this.name], null, 2);
                log.warning(message);

                Game.notify(message);
            }
        }
    }
};