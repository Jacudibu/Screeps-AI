StructureController.prototype.isDowngradeTimerBelowSafeModeThreshold = function() {
    return this.ticksToDowngrade < CONTROLLER_DOWNGRADE[this.level] - CONTROLLER_DOWNGRADE_SAFEMODE_THRESHOLD;
};