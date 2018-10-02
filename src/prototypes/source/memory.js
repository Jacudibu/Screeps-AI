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

Source.prototype.initializeMemory = function() {
    let initialMemory = {};
    initialMemory.workersAssigned = 0;
    initialMemory.workersMax = 1; // this._countFreeTilesAroundSource();

    this.room.memory.sources[this.id] = initialMemory;
};
