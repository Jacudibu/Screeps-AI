/**
 * Prints clickable directional buttons to the console in order to manually move a creep around.
 */
Creep.prototype.steeringWheel = function() {
    return getHTMLForDirection(this, TOP_LEFT,    "↖") + " " + getHTMLForDirection(this, TOP,    "↑") + " " + getHTMLForDirection(this, TOP_RIGHT,    "↗") + "\n" +
           getHTMLForDirection(this, LEFT,        "←") + " " +                                   "·"  + " " + getHTMLForDirection(this, TOP_RIGHT,    "→") + "\n" +
           getHTMLForDirection(this, BOTTOM_LEFT, "↙") + " " + getHTMLForDirection(this, BOTTOM, "↓") + " " + getHTMLForDirection(this, BOTTOM_RIGHT, "↘")
        ;
};

getHTMLForDirection = function(creep, direction, directionString)  {
    const onClick = "angular.element('body').injector().get('Connection').sendConsoleCommand(" +
                        `'Game.creeps[\\'${creep.name}\\'].move(${direction})'` +
                    ");";
    return `<a onClick="${onClick}">${directionString}</a>`;
};