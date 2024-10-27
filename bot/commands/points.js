const { getPoints } = require('../utils/database');

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

module.exports = checkPointsCommand;
