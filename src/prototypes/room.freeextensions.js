let freeRoomExtensions = {};
let areRoomExtensionsUpToDate = {};

Object.defineProperty(Room.prototype, 'freeExtensions', {
    get: function(){
        if(this._freeExtensions){
            return this._freeExtensions;
        } else {
            if (!areRoomExtensionsUpToDate[this.name] || !freeRoomExtensions[this.name]) {
                this._reloadFreeExtensionCache();
                return this._freeExtensions;
            }

            return this._freeExtensions = freeRoomExtensions[this.name].map(Game.getObjectById);
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});

Room.prototype._reloadFreeExtensionCache = function() {
    this._freeExtensions = this.myExtensions.filter(extension => extension && extension.energy < extension.energyCapacity);
    freeRoomExtensions[this.name] = this._freeExtensions.map(extension => extension.id);
    areRoomExtensionsUpToDate[this.name] = true;
};

Room.prototype.refreshFreeExtensionsInNextTick = function() {
    areRoomExtensionsUpToDate[this.name] = false;
};

Room.prototype.getClosestEmptyExtensionToPosition = function(creep, energy = 0) {
    if (this.freeExtensions.length === 0) {
        return ERR_NOT_FOUND;
    }

    let closestExtension = utility.getClosestObjectFromArray(creep, this.freeExtensions);

    if (energy > (closestExtension.energyCapacity - closestExtension.energy)) {
        _.remove(this._freeExtensions, extension => extension.id === closestExtension.id);
        _.remove(freeRoomExtensions[this.name], extensionsId => extensionsId === closestExtension.id);
    }

    return closestExtension;
};