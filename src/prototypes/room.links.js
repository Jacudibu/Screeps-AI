let controllerLinkIds = {};
let storageLinkIds = {};

Object.defineProperty(Room.prototype, "controllerLink", {
    get: function() {
        if (this._controllerLink) {
            return this._controllerLink;
        }
        if (controllerLinkIds[this.name]) {
            return this._controllerLink = Game.getObjectById(controllerLinkIds[this.name]);
        } else {
            const link = this._findControllerLink();
            if (link) {
                controllerLinkIds[this.name] = link.id;
                return this._controllerLink = link;
            } else {
                controllerLinkIds[this.name] = null;
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
        controllerLinkIds[this.name] = link.id;
    }
};

Object.defineProperty(Room.prototype, "storageLink", {
    get: function() {
        if (this._storageLink) {
            return this._storageLink;
        }
        if (storageLinkIds[this.name]) {
            return this._storageLink = Game.getObjectById(storageLinkIds[this.name]);
        } else {
            const link = this._findStorageLink();
            if (link) {
                storageLinkIds[this.name] = link.id;
                return this._storageLink = link;
            } else {
                storageLinkIds[this.name] = null;
                return this._storageLink = null;
            }
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});

Room.prototype._findStorageLink = function() {
    if (!this.storage) {
        return undefined;
    }

    let links = this.storage.pos.findInRange(FIND_STRUCTURES, 4, {filter: s => s.structureType === STRUCTURE_LINK });

    if (links.length === 0) {
        return undefined;
    }

    return links[0];
};

Room.prototype.forceStorageLinkReload = function() {
    const link = this._findStorageLink();
    if (link) {
        storageLinkIds[this.name] = link.id;
    }
};