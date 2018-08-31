let roomLabTasks = {};
let roomLabReactions = {};

let roomInputLabs = {};
let roomOutputLabs = {};
let roomInputOutExpiration = {};

const CACHE_EXPIRATION_TIME = 1000;
const CACHE_EXPIRATION_OFFSET = 20;
const LAB_RANGE = 2;

Object.defineProperty(Room.prototype, "labTask", {
    get: function() {
        if (roomLabTasks[this.name]) {
            return roomLabTasks[this.name];
        } else {
            this._setupLabMemoryIfNeeded();
            return roomLabTasks[this.name] = Memory.rooms[this.name].lab.task;
        }
    },
    set: function(value) {
        this._setupLabMemoryIfNeeded();
        roomLabTasks[this.name] = value;
        Memory.rooms[this.name].lab.task = value;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Room.prototype, "labReaction", {
    get: function() {
        if (roomLabReactions[this.name] !== undefined) {
            return roomLabReactions[this.name];
        } else {
            this._setupLabMemoryIfNeeded();
            return roomLabReactions[this.name] = Memory.rooms[this.name].lab.reaction;
        }
    },
    set: function(value) {
        this._setupLabMemoryIfNeeded();
        roomLabReactions[this.name] = value;
        Memory.rooms[this.name].lab.reaction = value;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Room.prototype, "inputLabs", {
    get: function() {
        if(this._inputLabs) {
            return this._inputLabs;
        } else {
            this._checkInputOutputLabCache();
            if (roomInputLabs[this.name]) {
                return this._inputLabs = roomInputLabs[this.name].map(Game.getObjectById);
            } else {
                return this._inputLabs = [];
            }
        }
    },
    set: function(){},
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Room.prototype, "outputLabs", {
    get: function() {
        if(this._outputLabs) {
            return this._outputLabs;
        } else {
            this._checkInputOutputLabCache();
            if (roomOutputLabs[this.name]) {
                return this._outputLabs = roomOutputLabs[this.name].map(Game.getObjectById);
            } else {
                return this._outputLabs = [];
            }
        }
    },
    set: function(){},
    enumerable: false,
    configurable: true,
});

Room.prototype._setupLabMemoryIfNeeded = function() {
    if (!Memory.rooms[this.name].lab) {
        Memory.rooms[this.name].lab = {};
    }
};

Room.prototype._checkInputOutputLabCache = function() {
    if(roomInputOutExpiration[this.name] && roomInputOutExpiration[this.name] < Game.time) {
        return;
    }

    if (roomInputLabs[this.name] && roomOutputLabs[this.name]) {
        return;
    }

    this._initializeInputOutputLabCache();
};

Room.prototype._initializeInputOutputLabCache = function() {
    roomInputLabs[this.name] = [];
    roomOutputLabs[this.name] = [];

    let highestSurroundingLabCount = 0;
    let labsInRange = {};
    const labs = this.labs;

    for (let lab of labs) {
        labsInRange[lab.id] = 0;
    }

    for (let currentLabIndex = 0; currentLabIndex < labs.length - 1; currentLabIndex++) {
        for (let checkedLabIndex = currentLabIndex + 1; checkedLabIndex < labs.length; checkedLabIndex++) {
            if (labs[currentLabIndex].pos.inRangeTo(labs[checkedLabIndex].pos, LAB_RANGE)) {
                labsInRange[labs[currentLabIndex].id]++;
                labsInRange[labs[checkedLabIndex].id]++;
            }
        }
    }

    for (let lab of labs) {
        if (labsInRange[lab.id] > highestSurroundingLabCount) {
            highestSurroundingLabCount = labsInRange[lab.id];
        }
    }

    for (let lab of labs) {
        if (labsInRange[lab.id] === highestSurroundingLabCount) {
            roomInputLabs[this.name].push(lab.id);
        } else {
            roomOutputLabs[this.name].push(lab.id);
        }
    }

    roomInputOutExpiration[this.name] = getFutureTimeWithRandomOffset(CACHE_EXPIRATION_TIME, CACHE_EXPIRATION_OFFSET);
};

