Object.defineProperty(Source.prototype, 'memory', {
    configurable: true,
    get: function() {
        if(_.isUndefined(this.room.memory.sources)) {
            this._initializeMemoryForAllSourcesInRoom();
        }
        if(!_.isObject(this.room.memory.sources)) {
            return undefined;
        }
        return this.room.memory.sources[this.id] =
            this.room.memory.sources[this.id] || {};
    },
    set: function(value) {
        if(_.isUndefined(this.room.memory.sources)) {
            this._initializeMemoryForAllSourcesInRoom();
        }
        if(!_.isObject(this.room.memory.sources)) {
            throw new Error('Could not set source memory');
        }
        this.room.memory.sources[this.id] = value;
    }
});

Source.prototype.setWorkersMax = function(amount) {
    this.memory.workersMax = amount;
};

Source.prototype._initializeMemoryForAllSourcesInRoom = function() {
    this.room.memory.sources = {};
    const sources = this.room.find(FIND_SOURCES);
    for (let i = 0; i < sources.length; i++) {
        this._initializeMemory(sources[i]);
    }
};

Source.prototype._initializeMemory = function(source) {
    let initialMemory = {};
    initialMemory.workersAssigned = 0;
    initialMemory.workersMax = source._countFreeTilesAroundSource(source);

    this.room.memory.sources[source.id] = initialMemory;
};

Source.prototype._countFreeTilesAroundSource = function() {
    let freeTileCount = 0;
    [this.pos.x - 1, this.pos.x, this.pos.x + 1].forEach(x => {
        [this.pos.y - 1, this.pos.y, this.pos.y + 1].forEach(y => {
            if (Game.map.getTerrainAt(x, y, this.pos.roomName) !== 'wall')
                freeTileCount++;
        }, this);
    }, this);

    return freeTileCount;
};