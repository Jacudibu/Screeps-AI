const respawnTTLs = {};
Object.defineProperty(Creep.prototype, "respawnTTL", {
    get: function() {
        if (respawnTTLs[this.name]) {
            return respawnTTLs[this.name];
        }

        if (this.memory.respawnTTL) {
            respawnTTLs[this.name] = this.memory.respawnTTL;
            return respawnTTLs[this.name];
        }

        return respawnTTLs[this.name] = null;
    },

    set: function(value) {
        respawnTTLs[this.name] = value;

        if (value) {
            this.memory.respawnTTL = value;
        } else {
            delete this.memory.respawnTTL;
        }
    },
    configurable: false,
    enumerable: false,
});