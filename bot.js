const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const createDiscordMessageImage = require('./generateMessageImage');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Load quotes from file
let quotes = JSON.parse(fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf-8')).quotes;

client.once('ready', async () => {
    console.log('Bot is online!');
    const guild = client.guilds.cache.get('1092290893807108216');
    if (guild) {
        const channel = guild.channels.cache.get('1092290893807108219');
        if (channel) {
            channel.send('because spawn has no eye for talent');
        } else {
            console.error('Channel not found');
        }
    } else {
        console.error('Guild not found');
    }
});

client.on('messageCreate', async message => {
    if (message.content === '!9quote') {
        try {
            const guild = message.guild;
            if (!guild) {
                message.reply('This command can only be used in a server.');
                return;
            }

            const member = await guild.members.fetch(process.env.USER_ID);
            const nickname = member.displayName;
            const avatarURL = member.user.displayAvatarURL({ format: 'png' });

            // Pick a random quote
            const quote = quotes[Math.floor(Math.random() * quotes.length)];

            // Generate image
            await createDiscordMessageImage(quote, nickname, avatarURL, './output.png');

            // Send image in the same channel without replying to the user
            await message.channel.send({ files: ['./output.png'] });
        } catch (error) {
            console.error(error);
            message.reply('Some shit didnt work idk probably canadas fault');
        }
    }

    if (message.content.startsWith('!add9quote ')) {
        const quote = message.content.replace('!add9quote ', '').trim();
        if (quote.length === 0) {
            message.reply('You fucked it up put an actual quote there dumbass');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#ad2440')
            .setDescription(quote)
            .setFooter({ text: 'React with 💀. If this gets 5 skulls, it will be added to the quotes list!' });

        const sentMessage = await message.channel.send({ embeds: [embed] });
        await sentMessage.react('💀');

        const filter = (reaction, user) => {
            return reaction.emoji.name === '💀' && !user.bot;
        };

        const collector = sentMessage.createReactionCollector({ filter, time: 21600000 }); // 6 hours in milliseconds

        collector.on('collect', (reaction, user) => {
            if (reaction.count >= 5) {
                quotes.push(quote);
                fs.writeFileSync(path.join(__dirname, 'quotes.json'), JSON.stringify({ quotes }, null, 2));
                message.channel.send('Quote added to the list!');
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size < 4) {
                message.channel.send('Quote not added. Not enough reactions.');
            }
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
