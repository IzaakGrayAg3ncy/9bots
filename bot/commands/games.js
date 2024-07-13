const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

const executeGamesCommand = async (message) => {
    try {
        const response = await axios.get('https://api.pandascore.co/lol/matches/upcoming', {
            params: {
                token: process.env.PANDASCORE_TOKEN,
                'page[size]': 50
            }
        });
        
        const matches = response.data;
        const today = new Date().toISOString().split('T')[0];
        const todaysMatches = matches.filter(match => match.scheduled_at.startsWith(today));
        
        if (todaysMatches.length === 0) {
            message.channel.send('No games scheduled for today.');
            return;
        }

        const matchFields = todaysMatches.map(match => {
            const { league, opponents, scheduled_at } = match;
            const teams = opponents.map(opponent => opponent.opponent.name).join(' vs ');
            const scheduledTime = moment(scheduled_at);
            const formattedTime = `BST: ${scheduledTime.tz('Europe/London').format('HH:mm')} / CET: ${scheduledTime.tz('Europe/Paris').format('HH:mm')} / EST: ${scheduledTime.tz('America/New_York').format('HH:mm')} / PST: ${scheduledTime.tz('America/Los_Angeles').format('HH:mm')}`;
            
            return {
                name: league.name,
                value: `${teams}\n${formattedTime}`
            };
        });

        const embed = new EmbedBuilder()
            .setTitle("Today's League of Legends Games")
            .setColor(0x00AE86)
            .addFields(matchFields)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error fetching games:', error);
        message.channel.send('Error fetching games.');
    }
};

module.exports = { executeGamesCommand };
