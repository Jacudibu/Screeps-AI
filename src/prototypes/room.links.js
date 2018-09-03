let controllerLinkIds = {};

Object.defineProperty(Room.prototype, "controllerLink", {
    get: function() {
        if (this._controllerLink) {
            return this._controllerLink;
        }
        if (controllerLinkIds[this.id]) {
            return this._controllerLink = Game.getObjectById(controllerLinkIds[this.id]);
        } else {
            const link = this._findControllerLink();
            if (link) {
                controllerLinkIds[this.id] = link.id;
                return this._controllerLink = link;
            } else {
                controllerLinkIds[this.id] = null;
                return this._controllerLink = null;
            }
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});

Room.prototype._findControllerLink = function() {
    let links = this.controller.pos.findInRange(FIND_STRUCTURES, 4, {filter: s => s.structureType === STRUCTURE_LINK });

    if (links.length === 0) {
        return undefined;
    }

    return links[0];
};

Room.prototype.forceControllerLinkReload = function() {
    const link = this._findControllerLink();
    if (link) {
        controllerLinkIds[this.id] = link.id;
    }
};