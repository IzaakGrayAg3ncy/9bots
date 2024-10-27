const { executeQuotesCommand } = require('../commands/quotes');
const { checkPointsCommand, executePointsCommand } = require('../commands/points');
const leaderboardCommand = require('../commands/leaderboard');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        executeQuotesCommand(message, client);
        checkPointsCommand(message);
        executePointsCommand(message);
        leaderboardCommand(message);
    },
};
