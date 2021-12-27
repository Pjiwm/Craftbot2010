import DiscordJS, { Intents } from 'discord.js'


const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})
// startup
client.on('ready', () => {
    console.log('bot is online')
    client.user?.setActivity({
        name: 'with your mom',
        type: 'PLAYING'
    })

    client.user?.setStatus('dnd')
})

// Command manager
const guildId = '925061126046220409'
const guild = client.guilds.cache.get(guildId)
let commands

if (guild) {
    commands = guild.commands
} else {
    commands = client.application?.commands
}

commands?.create({
    name: 'ping',
    description: 'response with pong'
})

client.login(process.env.DISCORD_KEY)