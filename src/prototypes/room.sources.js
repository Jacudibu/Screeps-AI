let roomSourceIds = {};

Object.defineProperty(Room.prototype, 'sources', {
    get: function() {
        if (!this._sources) {
            if (roomSourceIds[this.name] === undefined) {
                let sources = this.find(FIND_SOURCES);
                if (!sources) {
                    roomSourceIds[this.name] = null;
                    return this._sources = null;
                }

                roomSourceIds[this.name] = _.map(sources, source => source.id);
                return this._sources = sources;
            } else {
                return this._sources = _.map(roomSourceIds[this.name], sourceId => Game.getObjectById(sourceId));
            }
        } else {
            return this._sources;
        }
    },
    enumerable: false,
    configurable: true
});