let containerIds = {};
let containerConstructionSiteIds = {};

Object.defineProperty(Source.prototype, "nearbyContainer", {
    get: function() {
        if (this._nearbyContainer) {
            return this._nearbyContainer;
        }
        if (containerIds[this.id]) {
            return this._nearbyContainer = Game.getObjectById(containerIds[this.id]);
        } else {
            const container = this._findNearbyContainer();
            if (container) {
                containerIds[this.id] = container.id;
                return this._nearbyContainer = container;
            } else {
                return undefined;
            }
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Source.prototype, "nearbyContainerConstructionSite", {
    get: function() {
        if (this._nearbyContainerConstructionSite) {
            return this._nearbyContainerConstructionSite;
        }
        if (containerConstructionSiteIds[this.id]) {
            return this._nearbyContainerConstructionSite = Game.getObjectById(containerConstructionSiteIds[this.id]);
        } else {
            const constructionSite = this._findNearbyContainerConstructionSite();
            if (constructionSite) {
                containerConstructionSiteIds[this.id] = constructionSite.id;
                return this._nearbyContainerConstructionSite = constructionSite;
            } else {
                return undefined;
            }
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

Source.prototype._findNearbyContainerConstructionSite = function() {
    let constructionSites = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER });

    if (constructionSites.length === 0) {
        return undefined;
    }

    return constructionSites[0];
};

Source.prototype.getNearbyContainerPosition = function() {
    if (this.nearbyContainer) {
        return this.nearbyContainer.pos;
    } else {
        return this.getNearbyContainerConstructionSitePosition();
    }
};

Source.prototype.getNearbyContainerConstructionSitePosition = function() {
    if (this.nearbyContainerConstructionSite) {
        return this.nearbyContainerConstructionSite.pos;
    } else {
        return ERR_NOT_FOUND;
    }
};

Source.prototype.forceNearbyContainerReload = function() {
    const container = this._findNearbyContainer();
    if (container) {
        containerIds[this.id] = container.id;
        return;
    }

    const constructionSite = this._findNearbyContainerConstructionSite();
    if (constructionSite) {
        containerConstructionSiteIds[this.id] = constructionSite.id;
    }
};

Source.prototype.placeContainerConstructionSiteAndGetItsPosition = function(posForWhichContainerPositionShouldBeOptimized) {
    if (this.getNearbyContainerPosition() !== ERR_NOT_FOUND) {
        return this.getNearbyContainerPosition();
    }

    const containerPos = this.calculateContainerConstructionSitePosition(posForWhichContainerPositionShouldBeOptimized);

    if (this.room.createConstructionSite(containerPos, STRUCTURE_CONTAINER) === OK) {
        return containerPos;
    } else {
        return ERR_INVALID_ARGS;
    }
};

Source.prototype.calculateContainerConstructionSitePosition = function(posForWhichContainerPositionShouldBeOptimized) {
    if (this.getNearbyContainerPosition() !== ERR_NOT_FOUND) {
        return this.getNearbyContainerPosition();
    }

    const travelPath = Traveler.findTravelPath(this.pos, posForWhichContainerPositionShouldBeOptimized);
    return travelPath.path[0];
};
