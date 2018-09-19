/**
 * Heavily inspired by prototype.Room.structures v1.5 from SemperRabbit
 * Extended in order to further differentiate between structure owner.
 */

let roomStructures           = {};
let roomStructuresExpiration = {};

let myRoomStructures           = {};
let myRoomStructuresExpiration = {};

let hostileRoomStructures           = {};
let hostileRoomStructuresExpiration = {};


const CACHE_TIMEOUT = 50;
const CACHE_OFFSET  = 4;

const neutralMultipleList = [
    STRUCTURE_ROAD, STRUCTURE_WALL, STRUCTURE_KEEPER_LAIR, STRUCTURE_PORTAL, STRUCTURE_CONTAINER,
];

const ownedMultipleList = [
    STRUCTURE_SPAWN,    STRUCTURE_EXTENSION,    STRUCTURE_RAMPART,      STRUCTURE_LINK,
    STRUCTURE_TOWER,    STRUCTURE_LAB,          STRUCTURE_POWER_BANK,
];

const multipleList = [
    STRUCTURE_SPAWN,        STRUCTURE_EXTENSION,    STRUCTURE_ROAD,         STRUCTURE_WALL,
    STRUCTURE_RAMPART,      STRUCTURE_KEEPER_LAIR,  STRUCTURE_PORTAL,       STRUCTURE_LINK,
    STRUCTURE_TOWER,        STRUCTURE_LAB,          STRUCTURE_CONTAINER,	STRUCTURE_POWER_BANK,
];

const singleList = [
    STRUCTURE_OBSERVER,     STRUCTURE_POWER_SPAWN,  STRUCTURE_EXTRACTOR,	STRUCTURE_NUKER,
    //STRUCTURE_TERMINAL,   STRUCTURE_CONTROLLER,   STRUCTURE_STORAGE,
];

Room.prototype._checkRoomCache = function _checkRoomCache(){
    // if cache is expired or doesn't exist
    if(!roomStructuresExpiration[this.name] || !roomStructures[this.name] || roomStructuresExpiration[this.name] < Game.time){
        roomStructuresExpiration[this.name] = utility.getFutureGameTimeWithRandomOffset(CACHE_TIMEOUT, CACHE_OFFSET);
        roomStructures[this.name] = _.groupBy(this.find(FIND_STRUCTURES), s=>s.structureType);
        let i;
        for(i in roomStructures[this.name]){
            roomStructures[this.name][i] = _.map(roomStructures[this.name][i], s=>s.id);
        }
    }
};

Room.prototype._checkMyRoomCache = function _checkMyRoomCache(){
    // if cache is expired or doesn't exist
    if(!myRoomStructuresExpiration[this.name] || !myRoomStructures[this.name] || myRoomStructuresExpiration[this.name] < Game.time){
        myRoomStructuresExpiration[this.name] = utility.getFutureGameTimeWithRandomOffset(CACHE_TIMEOUT, CACHE_OFFSET);
        myRoomStructures[this.name] = _.groupBy(this.find(FIND_MY_STRUCTURES), s=>s.structureType);
        let i;
        for(i in myRoomStructures[this.name]){
            myRoomStructures[this.name][i] = _.map(myRoomStructures[this.name][i], s=>s.id);
        }
    }
};

Room.prototype._checkHostileRoomCache = function _checkHostileRoomCache(){
    // if cache is expired or doesn't exist
    if(!hostileRoomStructuresExpiration[this.name] || !hostileRoomStructures[this.name] || hostileRoomStructuresExpiration[this.name] < Game.time){
        hostileRoomStructuresExpiration[this.name] = utility.getFutureGameTimeWithRandomOffset(CACHE_TIMEOUT, CACHE_OFFSET);
        hostileRoomStructures[this.name] = _.groupBy(this.find(FIND_HOSTILE_STRUCTURES), s=>s.structureType);
        let i;
        for(i in hostileRoomStructures[this.name]){
            hostileRoomStructures[this.name][i] = _.map(hostileRoomStructures[this.name][i], s=>s.id);
        }
    }
};

// MY
ownedMultipleList.forEach(function(type){
    Object.defineProperty(Room.prototype, "my" + _.capitalize(type) + 's', {
        get: function(){
            if(this['_my' + type + 's']){
                return this['_my' + type + 's'];
            } else {
                this._checkMyRoomCache();
                if(myRoomStructures[this.name][type])
                    return this['_my'  +type + 's'] = myRoomStructures[this.name][type].map(Game.getObjectById);
                else
                    return this['_my' + type + 's'] = [];
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

// HOSTILE
ownedMultipleList.forEach(function(type){
    Object.defineProperty(Room.prototype, "hostile" + _.capitalize(type) + 's', {
        get: function(){
            if(this['_hostile' + type + 's']){
                return this['_hostile' + type + 's'];
            } else {
                this._checkHostileRoomCache();
                if(hostileRoomStructures[this.name][type])
                    return this['_hostile'  +type + 's'] = hostileRoomStructures[this.name][type].map(Game.getObjectById);
                else
                    return this['_hostile' + type + 's'] = [];
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

// ALL
multipleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type + 's', {
        get: function(){
            if(this['_' + type + 's']){
                return this['_' + type + 's'];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type])
                    return this['_'  +type + 's'] = roomStructures[this.name][type].map(Game.getObjectById);
                else
                    return this['_' + type + 's'] = [];
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });

    // without the 's', for cases where we need to use structureType directly
    Object.defineProperty(Room.prototype, type, {
        get: function(){
            return this[type + 's'];
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

singleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type, {
        get: function(){
            if(this['_' + type]){
                return this['_' + type];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type])
                    return this['_' + type] = Game.getObjectById(roomStructures[this.name][type][0]);
                else
                    return this['_' + type] = undefined;
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});