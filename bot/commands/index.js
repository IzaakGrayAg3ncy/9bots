const { executeGamesCommand } = require('./games');
const { executeUpcomingCommand } = require('./upcoming');
const { executeQuotesCommand } = require('./quotes');

const executeCommands = (message, client) => {
    if (message.content.toLowerCase().includes('frfr')) {
        try {
            message.react('🇫');
            message.react('🇷');
        } catch (error) {
            console.error('Error reacting with F and R emojis:', error);
        }
    }

    if (message.content.toLowerCase().includes('squidposting')) {
        try {
            message.react('🦑');
        } catch (error) {
            console.error('Error reacting with squid emoji:', error);
        }
    }

    if (message.content.toLowerCase().includes('british')) {
        try {
            message.react('🇬🇧');
            message.react('💪');
        } catch (error) {
            console.error('Error reacting with England flag and muscle emojis:', error);
        }
    }

    if (message.content.toLowerCase().includes('french')) {
        try {
            message.react('🤮');
        } catch (error) {
            console.error('Error reacting with vomit emoji:', error);
        }
    }

    if (message.content.startsWith('!upcoming')) {
        executeUpcomingCommand(message, client);
    }

    if (message.content === '!games') {
        executeGamesCommand(message, client);
    }

    if (message.content.startsWith('!9quote') || message.content.startsWith('!sw1tchspellings') || message.content.startsWith('!instigation') || message.content.startsWith('!add9quote') || message.content.startsWith('!addsw1tch') || message.content.startsWith('!addinstigation')) {
        executeQuotesCommand(message, client);
    }
};

module.exports = { executeCommands };
