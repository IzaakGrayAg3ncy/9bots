const { executeQuotesCommand } = require('../commands/quotes');
const checkPointsCommand = require('../commands/points');
const leaderboardCommand = require('../commands/leaderboard');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        executeQuotesCommand(message, client);
        checkPointsCommand(message);
        leaderboardCommand(message);
    },
};
