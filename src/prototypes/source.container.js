let containerIds = {};

Object.defineProperty(Source.prototype, "nearbyContainer", {
    get: function() {
        if (this._nearbyContainer) {
            return this._nearbyContainer;
        }
        if (containerIds[this.id]) {
            return this._nearbyContainer = Game.getObjectById(containerIds[this.id]);
        } else {
            const container = this._findNearbyContainer();
            containerIds[this.id] = container.id;
            return this._nearbyContainer = container;
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});

Source.prototype._findNearbyContainer = function() {
    let containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER });

    if (containers.length === 0) {
        return undefined;
    }

    return containers[0];
};

Source.prototype.getNearbyContainerPosition = function() {
    if (this.nearbyContainer) {
        return this.nearbyContainer.pos;
    } else {
        return ERR_NOT_FOUND;
    }
};

Source.prototype.forceNearbyContainerReload = function() {
    containerIds[this.id] = this._findNearbyContainer().id;
};