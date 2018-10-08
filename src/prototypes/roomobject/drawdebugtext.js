// original idea/script by mototroller
RoomObject.prototype.drawDebugText = function(what) {
    this.room.visual

        // line to text box
    .line(this.pos.x, this.pos.y, this.pos.x + 1 - 0.2, this.pos.y - 1, {
        color: "#eeeeee",
        opacity: 0.66,
        width: 0.1

        // dot at the center of the object
    }).circle(this.pos, {
        fill: "#aaffaa",
        opacity: 0.66

        // Black Background
    }).text(what, this.pos.x + 1, this.pos.y - 1, {
        color: "black",
        opacity: 0.4,
        align: "left",
        font: "bold 0.6 Arial",
        backgroundColor: "black",
        backgroundPadding: 0.3

        // Text with white background
    }).text(what, this.pos.x + 1, this.pos.y - 1, {
        color: "black",
        opacity: 0.66,
        align: "left",
        font: "bold 0.6 Arial",
        backgroundColor: "#eeeeee",
        backgroundPadding: 0.2
    });
};