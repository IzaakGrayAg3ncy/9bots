const { executeGamesCommand } = require('./games');
const { executeUpcomingCommand } = require('./upcoming');
const { executeQuotesCommand } = require('./quotes');

// Add this at the top of the file with other imports
const userReactions = {
    '590304012457214064': ['🇭', '🇦', '🇹', '🇪', '🇷'],  // This spells out "HATER"
    '142778699324981248': ['🇱', '🇺', '🇬', '🇴', '🇳', '🇪'],  // Lugone
    '76151670303625216': ['🇫', '🇱', '🇴', '🇷', '🇮', '🇩', '🇦'],  // Florida
    '133489640974843904': ['🇹', '🇱', '🇸', '🇺', '🇨', '🇇'],  // TLSUCK
    '158264851758579713': ['🇾', '🇦', '🇵'],  // YAP
    '99601123731607552': ['🇭', '🇵', '🇫', '🇮', '🇨'],  // HPFIC
    '102167874818314240': ['🇫', '🇦', '🇱', '🇪', '🌬️'],  // Fake fan (spelling out "FAKE" and using fan emoji)
    '213755220063158283': ['🇫', '🇱', '🇴', '🇵', '🇶', '🇺', '🇪', '🇸', '🇹'],  // Flopquest
    '711953160008368168': ['🇲', '🇦', '🇷', '🇸', '🇭', '🇯', '🇴', '🇳'],  // Marshjon
    '291670749041786880': ['🇩', '🇴', '🇼', '🇳', '🇧', '🇦', '🇩'],  // downbad
    '179125717370535937': ['🇫', '🇪', '🇦', '🇷'],  // fear
    '194961715560054784': ['🇫', '🇱', '🇴', '🇵', '🇶', '🇺', '🇪', '🇸', '🇹'],  // flopquest
    '784019976381005844': ['🐀', '🇷', '🇦', '🇹'],  // rat (using rat emoji and spelling out "rat")
    '772464118724165662': ['🇱', '🇦', '🇼', '🇾', '🇪', '🇷', '🇸', '🇮', '🇳', '🇨'],  // lawyers inc
};

const executeCommands = (message, client) => {
    if (message.content.toLowerCase().includes('frfr')) {
        try {
            message.react('🇫');
            message.react('🇷');
        } catch (error) {
            console.error('Error reacting with F and R emojis:', error);
        }
    }

    if (message.content.toLowerCase().includes('squidposting')) {
        try {
            message.react('🦑');
        } catch (error) {
            console.error('Error reacting with squid emoji:', error);
        }
    }

    if (message.content.toLowerCase().includes('british')) {
        try {
            message.react('🇬🇧');
            message.react('💪');
        } catch (error) {
            console.error('Error reacting with England flag and muscle emojis:', error);
        }
    }

    if (message.content.toLowerCase().includes('french')) {
        try {
            message.react('🤮');
        } catch (error) {
            console.error('Error reacting with vomit emoji:', error);
        }
    }

    if (message.content.startsWith('!upcoming')) {
        executeUpcomingCommand(message, client);
    }

    if (message.content === '!games') {
        executeGamesCommand(message, client);
    }

    if (message.content.startsWith('!9quote') || message.content.startsWith('!sw1tchspellings') || message.content.startsWith('!instigation') || message.content.startsWith('!add9quote') || message.content.startsWith('!addsw1tch') || message.content.startsWith('!addinstigation')) {
        executeQuotesCommand(message, client);
    }

    // Add this new section at the end of the function
    if (userReactions.hasOwnProperty(message.author.id)) {
        const roll = Math.random();
        console.log(`User ${message.author.id} rolled: ${roll.toFixed(4)}`);
        
        if (roll < 0.01) {
            console.log(`Reaction triggered for user ${message.author.id}`);
            const reactions = userReactions[message.author.id];
            reactions.forEach(async (reaction) => {
                try {
                    await message.react(reaction);
                    console.log(`Added reaction ${reaction}`);
                } catch (error) {
                    console.error(`Error reacting with ${reaction}:`, error);
                }
            });
        } else {
            console.log(`No reaction for user ${message.author.id}`);
        }
    }
};

module.exports = { executeCommands };
