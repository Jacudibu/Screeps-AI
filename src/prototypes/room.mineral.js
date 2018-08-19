let roomMineralIds = {};

Object.defineProperty(Room.prototype, 'mineral', {
    get: function() {
        if (!this._mineral) {
            if (roomMineralIds[this.name] === undefined) {
                let [mineral] = this.find(FIND_MINERALS);
                if (!mineral) {
                    roomMineralIds[this.name] = null;
                    return this._mineral = null;
                }
                roomMineralIds[this.name] = mineral.id;
                return this._mineral = mineral;
            } else {
                return this._mineral = Game.getObjectById(roomMineralIds[this.name]);
            }
        }
    },
    enumerable: false,
    configurable: true
});