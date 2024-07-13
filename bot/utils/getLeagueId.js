const axios = require('axios');

const knownLeagues = {
    'nacl': 'league-of-legends-north-american-challengers-league',
    'lec': 'league-of-legends-lec',
    'lcs': 'league-of-legends-lcs',
    'lck': 'league-of-legends-lck-champions-korea',
    'lpl': 'league-of-legends-lpl-china',
    'eum': 'league-of-legends-emea-masters'
};

const getLeagueId = async (leagueName) => {
    const slug = knownLeagues[leagueName.toLowerCase()];
    if (slug) {
        try {
            const response = await axios.get(`https://api.pandascore.co/leagues?search[slug]=${slug}`, {
                params: {
                    token: process.env.PANDASCORE_TOKEN
                }
            });

            const leagues = response.data;
            console.log('Available leagues:', leagues.map(l => `${l.name} (${l.slug})`));

            const league = leagues.find(l => l.slug === slug);
            return league ? league.id : null;
        } catch (error) {
            console.error('Error fetching leagues:', error.response ? error.response.data : error.message);
            return null;
        }
    } else {
        console.error(`League not found in known leagues: ${leagueName}`);
        return null;
    }
};

module.exports = { getLeagueId };
