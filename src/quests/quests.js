require("quests.questtypes");
const questCache = require("quests.questcache");

function Quest() {
    this.questType = null;
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