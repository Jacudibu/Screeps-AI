Room.prototype.checkForHostiles = function() {
    this._dangerousHostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: creep =>
            creep.pos.x !== 0 && creep.pos.x !== 49 && creep.pos.y !== 0 && creep.pos.y !== 49
            &&    (creep.countBodyPartsOfType(ATTACK) > 0
            || creep.countBodyPartsOfType(RANGED_ATTACK) > 0
            || creep.countBodyPartsOfType(HEAL) > 0
            || creep.countBodyPartsOfType(WORK) > 4 && creep.countBodyPartsOfType(CARRY) < 4)
    });
};

Room.prototype.updateThreat = function() {
    if (this._dangerousHostiles.length === 0) {
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

    for (let creep of this._dangerousHostiles) {
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

Room.prototype.askForHelpIfThreatDetected = function() {
    if (!this.threat) {
        this.memory.requiresHelp = undefined;
        return;
    }

    if (this.memory.requiresHelp === undefined) {
        const myDefenseForce = this.find(FIND_MY_CREEPS, {filter: creep => creep.memory.role === ROLE.DEFENDER});
        if (myDefenseForce.length === 0) {
            this.memory.requiresHelp = true;
            if (this.threat.players[0] !== "Invader" && this.threat.players[0] !== "Source Keeper" && this.controller
                && (this.controller.my || this.controller.reservation && this.controller.reservation.username === "Jacudibu")) {
                const message = this + " is being attacked by " + JSON.stringify(this.threat.players) + "<br>" +
                    "Threat info: " + JSON.stringify(this.threat, null, 2);
                log.warning(message);

                Game.notify(message);
            }
        }
    }
};