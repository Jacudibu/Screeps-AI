const LOG_INFO    = 0;
const LOG_WARNING = 1;
const LOG_ERROR   = 2;

const CONSOLE_LOG_LEVEL = LOG_INFO;
const MAIL_LOG_LEVEL    = LOG_ERROR;


writeMessage = function(message, logLevel, color=undefined) {
    if (logLevel < CONSOLE_LOG_LEVEL) {
        return;
    }

    let formattedMessage;
    if (color) {
        formattedMessage = "<span style=color:" + color + ">" + message + "</span>";
    } else {
        formattedMessage = message;
    }

    console.log(formattedMessage);

    if (logLevel < MAIL_LOG_LEVEL) {
        return;
    }

    Game.notify(formattedMessage);
};

global.log = {
    info: (message, color=undefined) => writeMessage(message, LOG_INFO, color),
    warning: (message) => writeMessage(message, LOG_WARNING, "#FFFF00"),
    error: (message) => writeMessage(message, LOG_ERROR, "#FF0000"),
};
