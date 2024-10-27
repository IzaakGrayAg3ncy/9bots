const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const createDiscordMessageImage = require('../helpers/generateMessageImage');
const { addPoints } = require('../utils/database'); // Import the addPoints function

// Load quotes from file
let quotes = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/quotes.json'), 'utf-8')).quotes;
// Load spellings from file
let spellings = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/spellings.json'), 'utf-8')).spellings;
let instigations = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/instigations.json'), 'utf-8')).instigations;

const executeQuotesCommand = async (message, client) => {
    console.log('executeQuotesCommand called'); // Log when the function is called

    if (message.content === '!9quote') {
        console.log('!9quote command detected'); // Log when the command is detected

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

            // Determine if it's a golden quote
            const roll = Math.random();
            const isGolden = roll < 0.2; // 20% chance

            // Log the roll number and golden status
            console.log(`Roll: ${roll.toFixed(4)}, Golden: ${isGolden}`);

            // Generate image
            await createDiscordMessageImage(quote, nickname, avatarURL, './output.png', isGolden);

            // Send image and message
            if (isGolden) {
                await message.channel.send("Wow, you found a super rare golden 9dots quote, you've earned 10 kittencord points! Congratulations!");
                addPoints(message.author.id, 10); // Add 10 points to the user
            }

            await message.channel.send({ files: ['./output.png'] });
        } catch (error) {
            console.error('Error in executeQuotesCommand:', error);
            message.reply('Some shit didnt work idk probably canadas fault');
        }
    }

    /*if (message.content === '!sw1tchspellings') {
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
    }*/

    if (message.content === '!instigation') {
        try {
            const guild = message.guild;
            if (!guild) {
                message.reply('This command can only be used in a server.');
                return;
            }

            // Pick a random instigation quote
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
        let forceAdded = false;
        let previousReactionCount = 0;
    
        const checkReactions = async () => {
            try {
                const reaction = sentMessage.reactions.cache.get('💀');
                if (reaction) {
                    const currentReactionCount = reaction.count;
                    console.log('Checking reactions', { currentReactionCount, previousReactionCount });
                    if (currentReactionCount < previousReactionCount) {
                        quotes.push(quote);
                        fs.writeFileSync(path.join(__dirname, '../data/quotes.json'), JSON.stringify({ quotes }, null, 2));
                        message.channel.send('Quote added to the list because the reaction count decreased!');
                        forceAdded = true;
                        collector.stop();
                        return;
                    }
                    previousReactionCount = currentReactionCount;
                }
            } catch (error) {
                console.error('Error checking reactions:', error);
            }
        };
    
        const reactionCheckInterval = setInterval(checkReactions, 5000); // Check every 5 seconds
    
        collector.on('collect', (reaction, user) => {
            if (reaction.count >= 5) {
                if (!quoteAdded) {
                    quotes.push(quote);
                    fs.writeFileSync(path.join(__dirname, '../data/quotes.json'), JSON.stringify({ quotes }, null, 2));
                    message.channel.send('Quote added to the list!');
                    quoteAdded = true;
                    collector.stop();
                }
            }
        });
    
        collector.on('end', collected => {
            clearInterval(reactionCheckInterval); // Clear the interval when collector ends
            if (!quoteAdded && !forceAdded) {
                message.channel.send('Quote not added. Not enough reactions.');
            }
        });
    
        // Monitor message deletion
        const userIdToMonitor = '174163262596710400'; // Replace with the specific user ID to monitor
    
        const deleteListener = async (deletedMessage) => {
            if (deletedMessage.id === sentMessage.id) {
                if (!quoteAdded) {
                    quotes.push(quote);
                    fs.writeFileSync(path.join(__dirname, '../data/quotes.json'), JSON.stringify({ quotes }, null, 2));
                    message.channel.send('Quote added to the list because dots deleted the message like the filthy rat he is');
                    forceAdded = true;
                    collector.stop();
                    client.off('messageDelete', deleteListener); // Clean up listener
                }
            }
        };
    
        client.on('messageDelete', deleteListener);
    }
    
    /*if (message.content.startsWith('!addsw1tch ')) {
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
                    fs.writeFileSync(path.join(__dirname, '../data/spellings.json'), JSON.stringify({ spellings }, null, 2));
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
    */

    if (message.content.startsWith('!addinstigation ')) {
        const quote = message.content.replace('!addinstigation ', '').trim();
        if (quote.length === 0) {
            message.reply('You fucked it up put an actual quote there dumbass');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#ad2440')
            .setDescription(quote)
            .setFooter({ text: 'React with 🎣. If this gets 5 🎣, it will be added to the instigations list!' });

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
                    fs.writeFileSync(path.join(__dirname, '../data/instigations.json'), JSON.stringify({ instigations }, null, 2));
                    message.channel.send('Instigation added to the list!');
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
};

const executeTestGoldenCommand = async (message, client) => {
    if (message.content === '!testgolden') {
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

            // Force golden quote
            const isGolden = true;

            // Generate image
            await createDiscordMessageImage(quote, nickname, avatarURL, './output.png', isGolden);

            // Send image and message
            await message.channel.send("Wow, you found a super rare golden 9dots quote, you've earned 10 kittencord points! Congratulations!");
            addPoints(message.author.id, 10); // Add 10 points to the user

            await message.channel.send({ files: ['./output.png'] });
        } catch (error) {
            console.error(error);
            message.reply('Some shit didnt work idk probably canadas fault');
        }
    }
};

// Export both functions
module.exports = { executeQuotesCommand, executeTestGoldenCommand };
