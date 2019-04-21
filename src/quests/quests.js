require("quests.questtypes");
const questCache = require("quests.questcache");

function Quest() {
    this.targetRoom = null;
    this.targetPos = null;
    this.questType = null;
    this.requestedCreepRoles = null;
    this.requestedStrength = null;
    this.assignedParty = null
}

global.Quests = {
    getAll() {
        return questCache.getAll();
    },

    add(quest) {
        questCache.getAll().push(quest);
        this.persist();
    },

    persist() {
        return questCache.persist();
    },
};