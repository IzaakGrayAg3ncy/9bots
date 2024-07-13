const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');
const { getLeagueId } = require('../utils/getLeagueId');

const executeUpcomingCommand = async (message) => {
    const args = message.content.split(' ');
    const leagueName = args.slice(1).join(' ').toLowerCase();  // Join all arguments for more flexibility
    if (!leagueName) {
        message.channel.send('Please specify a league. E.g., `!upcoming LCS`');
        return;
    }

    const leagueId = await getLeagueId(leagueName);
    if (!leagueId) {
        message.channel.send(`League not found: ${leagueName}`);
        return;
    }

    try {
        const response = await axios.get('https://api.pandascore.co/matches/upcoming', {
            params: {
                token: process.env.PANDASCORE_TOKEN,
                'filter[league_id]': leagueId,
                'page[size]': 50
            }
        });

        const matches = response.data;
        const now = moment();
        const nextWeek = moment().add(7, 'days');
        
        const upcomingMatches = matches.filter(match => {
            const matchDate = moment(match.scheduled_at);
            return matchDate.isBetween(now, nextWeek);
        });

        if (upcomingMatches.length === 0) {
            message.channel.send('No matches scheduled for the next week.');
            return;
        }

        let currentPage = 0;
        const itemsPerPage = 5;
        const totalPages = Math.ceil(upcomingMatches.length / itemsPerPage);

        const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const matchFields = upcomingMatches.slice(start, end).map(match => {
                const { league, opponents, scheduled_at } = match;
                const teamNames = opponents.map(opponent => opponent.opponent.name);
                let teams = `${teamNames[0]} vs ${teamNames[1] || 'TBD'}`;
                if (teamNames[0] === 'TBD' && (!teamNames[1] || teamNames[1] === 'TBD')) {
                    teams = 'TBD';
                }
                const scheduledTime = moment(scheduled_at);
                const formattedTime = `${scheduledTime.tz('Europe/London').format('DD MMM HH:mm')} BST / ${scheduledTime.tz('Europe/Paris').format('HH:mm')} CET / ${scheduledTime.tz('America/New_York').format('HH:mm')} EST / ${scheduledTime.tz('America/Los_Angeles').format('HH:mm')} PST`;

                return {
                    name: league.name,
                    value: `${teams}\n${formattedTime}`
                };
            });

            return new EmbedBuilder()
                .setTitle("Upcoming League of Legends Matches")
                .setColor(0x00AE86)
                .addFields(matchFields)
                .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
                .setTimestamp();
        };

        const generateActionRow = () => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                );
        };

        const initialMessage = await message.channel.send({
            embeds: [generateEmbed(currentPage)],
            components: [generateActionRow()]
        });

        const filter = (interaction) => ['prev', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
        const collector = initialMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'prev' && currentPage > 0) {
                currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
                currentPage++;
            }

            await interaction.update({
                embeds: [generateEmbed(currentPage)],
                components: [generateActionRow()]
            });
        });

        collector.on('end', () => {
            initialMessage.edit({ components: [] });
        });

    } catch (error) {
        console.error('Error fetching upcoming matches:', error.response ? error.response.data : error.message);
        message.channel.send('Error fetching upcoming matches.');
    }
};

module.exports = { executeUpcomingCommand };
