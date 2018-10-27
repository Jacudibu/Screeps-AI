const cachedValues = [
    "spawnRoom",
    "targetRoomName",
    "remoteHaulTargetRoom",
    "remoteHaulStorageRoom",
    "respawnTTL",
    "role",
    "stayInRoom",
];

// noinspection ConstantIfStatementJS
if (false) {
    // for autocompletion in IDE

    // noinspection UnreachableCodeJS
    Creep.prototype.spawnRoom = '';
    Creep.prototype.targetRoomName = '';
    Creep.prototype.remoteHaulTargetRoom = '';
    Creep.prototype.remoteHaulStorageRoom = '';
    Creep.prototype.respawnTTL = '';
    Creep.prototype.role = '';
    Creep.prototype.stayInRoom = '';
}

const caches = {};
addCachedProperty = function(propertyName) {
    caches[propertyName] = {};
    Object.defineProperty(Creep.prototype, propertyName, {
        get: function() {
            if (caches[propertyName][this.name]) {
                return caches[propertyName][this.name];
            }

            if (this.memory[propertyName]) {
                caches[propertyName][this.name] = this.memory[propertyName];
                return caches[propertyName][this.name];
            }

            return caches[propertyName][this.name] = null;
        },

        set: function(value) {
            caches[propertyName][this.name] = value;

            if (value) {
                this.memory[propertyName] = value;
            } else {
                delete this.memory[propertyName];
            }
        },
        configurable: false,
        enumerable: false,
    });
};

for (const cachedValue of cachedValues) {
    addCachedProperty(cachedValue);
}

utility.deleteCreepCacheOnDeath = function(creepName) {
    for (const cachedValue of cachedValues) {
        delete caches[cachedValue][creepName];
    }
};