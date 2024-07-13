const { executeCommands } = require('../commands');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        executeCommands(message, client);
    },
};
