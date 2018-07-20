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

Source.prototype._initializeMemory = function(source) {
    let initialMemory = {};
    initialMemory.workersAssigned = 0;
    initialMemory.workersMax = 3;

    this.room.memory.sources[source.id] = initialMemory;
};

Source.prototype._initializeMemoryForAllSourcesInRoom = function() {
    this.room.memory.sources = {};
    const sources = this.room.find(FIND_SOURCES);
    for (let i = 0; i < sources.length; i++) {
        this._initializeMemory(sources[i]);
    }
};
