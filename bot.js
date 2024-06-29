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
// Load spellings from file
let spellings = JSON.parse(fs.readFileSync(path.join(__dirname, 'spellings.json'), 'utf-8')).spellings;

let instigations = JSON.parse(fs.readFileSync(path.join(__dirname, 'instigations.json'), 'utf-8')).instigations;

client.once('ready', async () => {
    console.log('Bot is online!');
    const guild = client.guilds.cache.get('1092290893807108216');
    if (guild) {
        const channel = guild.channels.cache.get('1092290893807108219');
        if (channel) {
            channel.send('?');
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

    if (message.content === '!sw1tchspellings') {
        try {
            const guild = message.guild;
            if (!guild) {
                message.reply('This command can only be used in a server.');
                return;
            }

            // Pick a random spelling quote
            const quote = spellings[Math.floor(Math.random() * spellings.length)];

            // Send the quote as a message
            await message.channel.send(quote);
        } catch (error) {
            console.error(error);
            message.reply('Some shit didnt work idk probably canadas fault');
        }
    }

    if (message.content === '!instigation') {
        try {
            const guild = message.guild;
            if (!guild) {
                message.reply('This command can only be used in a server.');
                return;
            }

            // Pick a random spelling quote
            const quote = instigations[Math.floor(Math.random() * instigations.length)];

            // Send the quote as a message
            await message.channel.send(quote);
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
    
        let quoteAdded = false;
    
        collector.on('collect', (reaction, user) => {
            if (reaction.count >= 5) {
                if (!quoteAdded) {
                    quotes.push(quote);
                    fs.writeFileSync(path.join(__dirname, 'quotes.json'), JSON.stringify({ quotes }, null, 2));
                    message.channel.send('Quote added to the list!');
                    quoteAdded = true;
                    collector.stop();
                }
            }
        });
    
        collector.on('end', collected => {
            if (!quoteAdded) {
                message.channel.send('Quote not added. Not enough reactions.');
            }
        });
    
        // Monitor message deletion or reaction removal
        const userIdToMonitor = '590304012457214064'; // Replace with the specific user ID to monitor
    
        const deleteListener = async (deletedMessage) => {
            if (deletedMessage.id === sentMessage.id && deletedMessage.author.id === userIdToMonitor) {
                quotes.push(quote);
                fs.writeFileSync(path.join(__dirname, 'quotes.json'), JSON.stringify({ quotes }, null, 2));
                message.channel.send('Quote added because 9dots engaged in rat behaviour');
                client.off('messageDelete', deleteListener); // Clean up listener
            }
        };
    
        const reactionRemoveListener = async (messageReaction, user) => {
            if (messageReaction.message.id === sentMessage.id && user.id === userIdToMonitor) {
                quotes.push(quote);
                fs.writeFileSync(path.join(__dirname, 'quotes.json'), JSON.stringify({ quotes }, null, 2));
                message.channel.send('Quote added because 9dots engaged in rat behaviour');
                client.off('messageReactionRemove', reactionRemoveListener); // Clean up listener
            }
        };
    
        client.on('messageDelete', deleteListener);
        client.on('messageReactionRemove', reactionRemoveListener);
    }

    if (message.content.startsWith('!addsw1tch ')) {
        const quote = message.content.replace('!addsw1tch ', '').trim();
        if (quote.length === 0) {
            message.reply('You fucked it up put an actual quote there dumbass');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#ad2440')
            .setDescription(quote)
            .setFooter({ text: 'React with 💯. If this gets 5 💯, it will be added to the spellings list!' });

        const sentMessage = await message.channel.send({ embeds: [embed] });
        await sentMessage.react('💯');

        const filter = (reaction, user) => {
            return reaction.emoji.name === '💯' && !user.bot;
        };

        const collector = sentMessage.createReactionCollector({ filter, time: 21600000 }); // 6 hours in milliseconds

        let quoteAdded = false;

        collector.on('collect', (reaction, user) => {
            if (reaction.count >= 5) {
                if (!quoteAdded) {
                    spellings.push(quote);
                    fs.writeFileSync(path.join(__dirname, 'spellings.json'), JSON.stringify({ spellings }, null, 2));
                    message.channel.send('Spelling added to the list!');
                    quoteAdded = true;
                    collector.stop();
                }
            }
        });

        collector.on('end', collected => {
            if (!quoteAdded) {
                message.channel.send('Spelling not added. Not enough reactions.');
            }
        });
    }

    if (message.content.startsWith('!addinstigation ')) {
        const quote = message.content.replace('!addinstigation ', '').trim();
        if (quote.length === 0) {
            message.reply('You fucked it up put an actual quote there dumbass');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#ad2440')
            .setDescription(quote)
            .setFooter({ text: 'React with 🎣. If this gets 5 🎣, it will be added to weebs list!' });

        const sentMessage = await message.channel.send({ embeds: [embed] });
        await sentMessage.react('🎣');

        const filter = (reaction, user) => {
            return reaction.emoji.name === '🎣' && !user.bot;
        };

        const collector = sentMessage.createReactionCollector({ filter, time: 21600000 }); // 6 hours in milliseconds

        let quoteAdded = false;

        collector.on('collect', (reaction, user) => {
            if (reaction.count >= 5) {
                if (!quoteAdded) {
                    instigations.push(quote);
                    fs.writeFileSync(path.join(__dirname, 'instigations.json'), JSON.stringify({ instigations }, null, 2));
                    message.channel.send('down with weeb :)');
                    quoteAdded = true;
                    collector.stop();
                }
            }
        });

        collector.on('end', collected => {
            if (!quoteAdded) {
                message.channel.send('Instigation not added. Not enough reactions.');
            }
        });
    }

    const reactions = {
        '291670749041786880': ['🇩', '🇴', '🇼', '🇳', '🇧', '🇦', '🇩'],
        '142778699324981248': ['🇱', '🇺', '🇬', '🇪', '🇷', '🇧', '🇦', '🇩'],
        '133489640974843904': ['🇹', '🇱', '🇸', '🇺', '🇨', '🇰'],
        '590304012457214064': ['🇭', '🇦', '🇹', '🇪', '🇷']
    };
    
    for (const [userId, emojis] of Object.entries(reactions)) {
        if (message.author.id === userId && Math.random() < 0.01) {
            try {
                for (const emoji of emojis) {
                    await message.react(emoji);
                }
            } catch (error) {
                console.error(`quit u fucking suck - ${emojis.join(' ')}`, error);
            }
        }
    }    
});

client.login(process.env.DISCORD_TOKEN);
