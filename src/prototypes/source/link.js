let linkIds = {};

Object.defineProperty(Source.prototype, "nearbyLink", {
    get: function() {
        if (this._nearbyLink) {
            return this._nearbyLink;
        }
        if (linkIds[this.id]) {
            return this._nearbyLink = Game.getObjectById(linkIds[this.id]);
        } else {
            const link = this._findNearbyLink();
            if (link) {
                linkIds[this.id] = link.id;
                return this._nearbyLink = link;
            } else {
                linkIds[this.id] = null;
                return this._nearbyLink = null;
            }
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});

Source.prototype._findNearbyLink = function() {
    let links = this.pos.findInRange(FIND_STRUCTURES, 2, {filter: s => s.structureType === STRUCTURE_LINK });

    if (links.length === 0) {
        return undefined;
    }

    return links[0];
};

Source.prototype.forceNearbyLinkReload = function() {
    const link = this._findNearbyLink();
    if (link) {
        linkIds[this.id] = link.id;
    }
};