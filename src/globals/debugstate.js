global.DEBUG_STATE = {};

if (Memory.debugstate) {
    global.DEBUG_STATE = Memory.debugstate;
} else {
    global.DEBUG_STATE.DRAW_ROADS = false;
    global.DEBUG_STATE.DRAW_LABS = true;

    Memory.debugstate = global.DEBUG_STATE;
}