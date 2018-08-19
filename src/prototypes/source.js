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

Source.prototype.initializeMemory = function() {
    let initialMemory = {};
    initialMemory.workersAssigned = 0;
    initialMemory.workersMax = 1; // this._countFreeTilesAroundSource();

    this.room.memory.sources[this.id] = initialMemory;
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

Source.prototype.getContainerPosition = function() {
    if (this.memory.containerId) {
        let obj = Game.getObjectById(this.memory.containerId);
        if (obj) {
            return obj.pos;
        } else {
            this.memory.containerId = undefined;
        }
    }

    let containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER });

    if (containers.length === 0) {
        return ERR_NOT_FOUND;
    }

    let container = containers[0];

    this.memory.containerId = container.id;
    return container.pos;
};