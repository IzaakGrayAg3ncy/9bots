const { getLeaderboard } = require('../utils/database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const leaderboardCommand = async (message) => {
    if (message.content.startsWith('!leaderboard')) {
        try {
            const leaderboard = getLeaderboard();
            const pageSize = 10;
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * pageSize;
                const end = start + pageSize;
                const currentLeaderboard = leaderboard.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle('Kittencord Points Leaderboard')
                    .setColor('#0099ff')
                    .setDescription(
                        currentLeaderboard.map((entry, index) => `${start + index + 1}. <@${entry.user_id}> - ${entry.points} points`).join('\n')
                    )
                    .setFooter({ text: `Page ${page + 1} of ${Math.ceil(leaderboard.length / pageSize)}` });

                return embed;
            };

            const row = new ActionRowBuilder()
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
                        .setDisabled(currentPage === Math.ceil(leaderboard.length / pageSize) - 1)
                );

            const messageEmbed = await message.channel.send({ embeds: [generateEmbed(currentPage)], components: [row] });

            const filter = (interaction) => ['prev', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
            const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'prev' && currentPage > 0) {
                    currentPage--;
                } else if (interaction.customId === 'next' && currentPage < Math.ceil(leaderboard.length / pageSize) - 1) {
                    currentPage++;
                }

                await interaction.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [
                        new ActionRowBuilder()
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
                                    .setDisabled(currentPage === Math.ceil(leaderboard.length / pageSize) - 1)
                            )
                    ]
                });
            });

            collector.on('end', () => {
                messageEmbed.edit({ components: [] });
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            message.reply('Could not retrieve leaderboard. Please try again later.');
        }
    }
};

module.exports = leaderboardCommand;
