const { getPoints, addPoints, removePoints } = require('../utils/database');

const allowedUserId = '174163262596710400'; // The user ID allowed to use these commands

const checkPointsCommand = async (message) => {
    if (message.content.startsWith('!checkpoints')) {
        const mentionedUser = message.mentions.users.first();
        const userId = mentionedUser ? mentionedUser.id : message.author.id;

        try {
            const points = await getPoints(userId);
            const username = mentionedUser ? mentionedUser.username : message.author.username;
            message.reply(`${username} has ${points} kittencord points.`);
        } catch (error) {
            console.error('Error fetching points:', error);
            message.reply('Could not retrieve points. Please try again later.');
        }
    }
};

const executePointsCommand = async (message) => {
    const args = message.content.split(' ');

    if (args[0] === '!givepoints' || args[0] === '!removepoints') {
        if (message.author.id !== allowedUserId) {
            message.reply("no no no nice try this is a dictatorship");
            return;
        }

        if (args.length < 3) {
            message.reply("Please mention a user and provide the number of points.");
            return;
        }

        // Extract the user mention
        const userMention = args[1];
        const targetUser = message.mentions.users.first();

        if (!targetUser) {
            message.reply("Please mention a valid user.");
            return;
        }

        const points = parseInt(args[2], 10);

        if (isNaN(points)) {
            message.reply("Please provide a valid number of points.");
            return;
        }

        if (args[0] === '!givepoints') {
            addPoints(targetUser.id, points);
            message.reply(`Added ${points} points to ${targetUser.username}.`);
        } else if (args[0] === '!removepoints') {
            removePoints(targetUser.id, points);
            message.reply(`Removed ${points} points from ${targetUser.username}.`);
        }
    }
};

module.exports = { checkPointsCommand, executePointsCommand };
