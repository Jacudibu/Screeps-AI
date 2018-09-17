/* Posted Jan 14th, 2017 by @semperrabbit*/
/* Modified by me in order to work with our memory layout as well as to not display the roomName all the time*/
/* This code will provide the ability to toString() Creep, Structure, StructureSpawn and Flag objects to the console with a link that will take you to the room, select the creep and add the temporary Memory watch to the Memory tab. (highlighting Flag object currently does not work, but it will still take you to the room and add the Memory watch)*/

// Special thanks to @helam for finding the client selection code
wrapWithHtmlLinkToRoomPosition = function(text, obj, memWatch = undefined) {
    let onClick  = '';
    if(obj.id)      onClick += `angular.element('body').injector().get('RoomViewPendingSelector').set('${obj.id}');`;
    if(memWatch)    onClick += `angular.element($('section.memory')).scope().Memory.addWatch('${memWatch}');angular.element($('section.memory')).scope().Memory.selectedObjectWatch='${memWatch}';`;

    const roomName = obj.room ? obj.room.name : obj.name;

    return `<a href="#!/room/${Game.shard.name}/${roomName}" onClick="${onClick}">${text}</a>`;
};

Creep.prototype.toString = function () {
    return wrapWithHtmlLinkToRoomPosition(`[${this.room.name}|${(this.name ? this.name : this.id)}]`, this, 'creeps.' + this.name);
};

Structure.prototype.toString = function () {
    return wrapWithHtmlLinkToRoomPosition(`[structure (${this.structureType}) #${this.id}]`, this);
};

StructureSpawn.prototype.toString = function () {
    return wrapWithHtmlLinkToRoomPosition(`[structure (${this.structureType}) #${this.id}]`, this);
};

Flag.prototype.toString = function () {
    return wrapWithHtmlLinkToRoomPosition(`[flag ${this.name}]`, this, 'flags.' + this.name);
};

Room.prototype.toString = function() {
    return wrapWithHtmlLinkToRoomPosition(`[room ${this.name}]`, this, 'rooms.' + this.name);
};