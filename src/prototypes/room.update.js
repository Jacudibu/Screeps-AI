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
    this.tryPlacingConstructionSites();
};