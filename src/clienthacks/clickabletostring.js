/* Posted Jan 14th, 2017 by @semperrabbit*/
/* Modified by me in order to work with our memory layout as well as to not display the roomName all the time*/
/* This code will provide the ability to toString() Creep, Structure, StructureSpawn and Flag objects to the console with a link that will take you to the room, select the creep and add the temporary Memory watch to the Memory tab. (highlighting Flag object currently does not work, but it will still take you to the room and add the Memory watch)*/

// Special thanks to @helam for finding the client selection code
wrapWithHtmlLinkToRoomPosition = function(text, obj, memWatch = undefined) {
    let onClick = '';
    if(obj.id)      onClick += `angular.element('body').injector().get('RoomViewPendingSelector').set('${obj.id}');`;
    if(memWatch)    onClick += `angular.element($('section.memory')).scope().Memory.addWatch('${memWatch}');angular.element($('section.memory')).scope().Memory.selectedObjectWatch='${memWatch}';`;

    return `<a href="#!/room/${Game.shard.name}/${obj.room.name}" onClick="${onClick}">${text}</a>`;
};

Creep.prototype.toString = function (htmlLink = true){
    return wrapWithHtmlLinkToRoomPosition(`[${(this.name ? this.name : this.id)}]`, this, 'creeps.' + this.name);
};

Structure.prototype.toString = function (htmlLink = true){
    return wrapWithHtmlLinkToRoomPosition(`[structure (${this.structureType}) #${this.id}]`, this);
};

StructureSpawn.prototype.toString = function (htmlLink = true){
    return wrapWithHtmlLinkToRoomPosition(`[structure (${this.structureType}) #${this.id}]`, this);
};

Flag.prototype.toString = function (htmlLink = true){
    return wrapWithHtmlLinkToRoomPosition(`[flag ${this.name}]`, this, 'flags.' + this.name);
};