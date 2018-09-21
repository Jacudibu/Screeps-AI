Room.prototype.updateBeforeCreeps = function() {
    this.checkForHostiles();
    this.updateThreat();
    this.askForHelpIfThreatDetected();
};

Room.prototype.updateAfterCreeps = function() {
    this.askForHelpIfThreatDetected();
    this.sortHostilesByPriority();

    if (!(this.controller && this.controller.my)) {
        return;
    }

    this.attackHostiles();
    this.repairDamagedCreeps();
    this.repairAlmostBrokenRamparts();
    this.checkForRCLUpdate();
    this.tryPlacingConstructionSites();
};

let lastRCL = {};
Room.prototype.checkForRCLUpdate = function() {
    if (!this.memory.lastRCL) {
        this.memory.lastRCL = this.controller.level;
        lastRCL[this.name] = this.controller.level;

        if (this.controller.level === 1) {
            log.warning(this + " new room established!");
        }

        this.onRCLUpdate();
        return;
    }

    if (!lastRCL[this.name]) {
        lastRCL[this.name] = this.memory.lastRCL;
        return;
    }

    if (lastRCL[this.name] === this.controller.level) {
        return;
    }

    log.info(this + " RCL UPDATE! " + lastRCL[this.name] + " -> " + this.controller.level);

    lastRCL[this.name] = this.controller.level;
    this.memory.lastRCL = this.controller.level;

    this.onRCLUpdate();
};

Room.prototype.onRCLUpdate = function() {
    this.updateRequestedCreeps();
    this._forceConstructionUpdate();
};